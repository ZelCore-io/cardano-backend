const config = require('config');
const serviceHelper = require('./serviceHelper');

const { apiUrl } = config;

// max 1000 utxos to be fetched
async function fetchUtxos(address, limit = 1000, page = 1) {
  // api provides max 100 utxos per page
  const count = limit > 100 ? 100 : limit;
  const utxoUrl = `${apiUrl}/addresses/${address}/utxos?order=asc&count=${count}&page=${page}`;
  const { data } = await serviceHelper.axiosGet(utxoUrl, {
    timeout: 30000,
    headers: {
      project_id: config.apiSecret,
    },
  });
  if (typeof data !== 'object') { throw new Error('Utxos are not an object'); }
  let utxosFetchedCoin = data;
  let utxosFetched = data.length;
  let pageA = page;
  while (utxosFetched === 100 && utxosFetchedCoin.length < limit) {
    pageA += 1;
    const nextTxUrl = `${apiUrl}/addresses/${address}/utxos?order=asc&count=${count}&page=${pageA}`;
    // eslint-disable-next-line no-await-in-loop
    const { data: nextData } = await serviceHelper.axiosGet(nextTxUrl, {
      timeout: 30000,
      headers: {
        project_id: config.apiSecret,
      },
    });
    if (typeof nextData !== 'object') { throw new Error('Utxos are not an object'); }
    utxosFetchedCoin = utxosFetchedCoin.concat(nextData);
    console.log(nextData.length);
    utxosFetched = nextData.length;
  }

  return utxosFetchedCoin;
}

async function getUtxosForAddress(address, limit = 1000) {
  const utxos = await fetchUtxos(address, limit);
  // create new set of utxos to remove potential duplicates
  const uniqueUtxos = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const utxo of utxos) {
    const found = uniqueUtxos.find((u) => u.tx_hash === utxo.tx_hash && u.output_index === utxo.output_index);
    if (!found) {
      uniqueUtxos.push(utxo);
    }
  }
  return uniqueUtxos;
}

module.exports = {
  getUtxosForAddress,
  fetchUtxos,
};
