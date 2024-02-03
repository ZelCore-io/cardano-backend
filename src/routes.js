const cardanoApi = require('./apiServices/cardanoApi');

module.exports = (app) => {
  // return sync data
  app.get('/v1/txs/:address?/:limit?', (req, res) => {
    cardanoApi.getTxs(req, res);
  });
};
