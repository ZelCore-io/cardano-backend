const config = require('config');
const axios = require('axios');

const { apiUrl } = config;

async function submitTx(tx) {
  const txUrl = `${apiUrl}/tx/submit`;
  const headers = {
    project_id: config.apiSecret,
    'Content-Type': 'application/cbor',
    Accept: 'application/json',
  };

  const bufferTx = Buffer.from(tx, 'hex');
  const { data } = await axios.post(txUrl, bufferTx, {
    headers,
    timeout: 30000,
  });

  return data;
}

module.exports = {
  submitTx,
};
