const config = require('config');
const serviceHelper = require('./serviceHelper');

const { apiUrl } = config;

async function getBalancesForAddress(address) {
  const txUrl = `${apiUrl}/addresses/${address}`;
  const { data } = await serviceHelper.axiosGet(txUrl, {
    timeout: 30000,
    headers: {
      project_id: config.apiSecret,
    },
  });
  if (typeof data !== 'object') { throw new Error('Balances are not an object'); }

  return data;
}

module.exports = {
  getBalancesForAddress,
};
