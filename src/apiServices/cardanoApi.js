const cardanoService = require('../services/cardanoTxsService');
const log = require('../lib/log');

async function getTxs(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    if (!address) {
      res.sendStatus(400);
      return;
    }
    let { limit } = req.params;
    limit = Number(limit || req.query.limit || 50) || 50;
    if (limit > 5000) {
      limit = 5000;
    }
    const txs = await cardanoService.getTxsFoAddress(address, limit) || [];
    res.json(txs);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

module.exports = {
  getTxs,
};
