const config = require('config');
const plimit = require('p-limit');
const serviceHelper = require('./serviceHelper');

const ppLimit = plimit(50);

const { apiUrl } = config;

async function getMultipleTxs(txs) {
  const promises = [];
  const promisesB = [];
  // get the txs from our database
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const query = { hash: { $in: txs } };
  const projetion = { _id: 0 };
  console.log(`Total ${txs.length}txs`);
  const txDetails = await serviceHelper.findInDatabase(database, config.collections.txs, query, projetion);
  console.log(`Using ${txDetails.length} txs from database`);
  // get txs that are missing in our database
  const missingTxs = txs.filter((key) => !txDetails.find((tx) => tx.hash === key));
  // if we have some missing txs, we need to fetch them from the api
  // eslint-disable-next-line no-restricted-syntax
  for (const mtx of missingTxs) {
    promises.push(ppLimit(() => serviceHelper.axiosGet(`${apiUrl}/txs/${mtx}`, { timeout: 30000, headers: { project_id: config.apiSecret } })));
    promisesB.push(ppLimit(() => serviceHelper.axiosGet(`${apiUrl}/txs/${mtx}/utxos`, { timeout: 30000, headers: { project_id: config.apiSecret } })));
  }
  if (promises.length) {
    console.log(`Fetching ${promises.length} txs from api`);
    const data = await Promise.allSettled(promises).catch((e) => { console.log(e); return []; });
    const dataB = await Promise.allSettled(promisesB).catch((e) => { console.log(e); return []; });
    const txDetailsFromApi = data.filter((tx) => tx.status === 'fulfilled').map((tx) => tx.value);
    const txDetailsFromApiB = dataB.filter((tx) => tx.status === 'fulfilled').map((tx) => tx.value);
    // eslint-disable-next-line no-restricted-syntax
    for (const tx of txDetailsFromApi) {
      if (tx.data) {
        // find the utxos for this tx
        const utxos = txDetailsFromApiB.find((utxo) => utxo.data.hash === tx.data.hash);
        if (utxos) {
          tx.data.inputs = utxos.data.inputs;
          tx.data.outputs = utxos.data.outputs;
          // update these txs in our database
          // eslint-disable-next-line no-await-in-loop
          await serviceHelper.findOneAndUpdateInDatabase(database, config.collections.txs, { hash: tx.data.hash }, { $set: tx.data }, { upsert: true });
          txDetails.push(tx.data);
        } // if we dont have utxos we disregard this tx
      }
    }
  }
  return txDetails;
}

async function fetchTxs(address, limit = 50, page = 1) {
  // api provides max 100 txs per page
  const count = limit > 100 ? 100 : limit;
  const txUrl = `${apiUrl}/addresses/${address}/txs?order=desc&count=${count}&page=${page}`;
  const { data } = await serviceHelper.axiosGet(txUrl, {
    timeout: 30000,
    headers: {
      project_id: config.apiSecret,
    },
  });
  if (typeof data !== 'object') { throw new Error('Transactions are not an object'); }
  let txsFetchedCoin = data;
  let txsFetched = data.length;
  let pageA = page;
  while (txsFetched === 100 && txsFetchedCoin.length < limit) {
    pageA += 1;
    let adjCount = count;
    if (pageA * 100 > limit) {
      adjCount = limit - (pageA - 1) * 100;
    }
    const nextTxUrl = `${apiUrl}/addresses/${address}/txs?order=desc&count=${adjCount}&page=${pageA}`;
    // eslint-disable-next-line no-await-in-loop
    const { data: nextData } = await serviceHelper.axiosGet(nextTxUrl, {
      timeout: 30000,
      headers: {
        project_id: config.apiSecret,
      },
    });
    if (typeof nextData !== 'object') { throw new Error('Transactions are not an object'); }
    txsFetchedCoin = txsFetchedCoin.concat(nextData);
    console.log(nextData.length);
    txsFetched = nextData.length;
  }

  return txsFetchedCoin;
}

async function getTxsForAddress(address, limit = 50) {
  const txs = await fetchTxs(address, limit);
  // create new set of txs to remove duplicates
  const uniqueTxs = [...new Set(txs)];
  const txDetails = await getMultipleTxs(uniqueTxs);
  return txDetails;
}

module.exports = {
  getMultipleTxs,
  getTxsForAddress,
  fetchTxs,
};
