const cardanoApi = require('./apiServices/cardanoApi');

module.exports = (app) => {
  // return sync data
  app.get('/v1/txs/:address?/:limit?', (req, res) => {
    cardanoApi.getTxs(req, res);
  });
  app.get('/v1/balances/:address?', (req, res) => {
    cardanoApi.geBalances(req, res);
  });
  app.get('/v1/utxos/:address?', (req, res) => {
    cardanoApi.getUtxos(req, res);
  });
};
