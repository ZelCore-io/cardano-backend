const config = require('config');
const axios = require('axios');
const cborg = require('cborg');

const { apiUrl } = config;

async function submitTx(tx) {
  const txUrl = `${apiUrl}/tx/submit`;
  const headers = {
    project_id: config.apiSecret,
    'Content-Type': 'application/cbor',
    Accept: 'application/json',
  };
  const encoded = cborg.encode(tx);
  const { data } = await axios.post(txUrl, encoded, {
    headers,
    timeout: 30000,
  });

  return data;
}

module.exports = {
  submitTx,
};
