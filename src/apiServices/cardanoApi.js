const cardanoTxsService = require('../services/cardanoTxsService');
const cardanoBalanceService = require('../services/cardanoBalancesService');
const cardanoUtxoService = require('../services/cardanoUtxosService');
const cardanoSubmitTxService = require('../services/cardanoSubmitTxService');

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
    const txs = await cardanoTxsService.getTxsForAddress(address, limit) || [];
    res.json(txs);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

async function getBalances(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    if (!address) {
      res.sendStatus(400);
      return;
    }
    const txs = await cardanoBalanceService.getBalancesForAddress(address) || {};
    res.json(txs);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

async function getUtxos(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    if (!address) {
      res.sendStatus(400);
      return;
    }
    const utxos = await cardanoUtxoService.getUtxosForAddress(address) || [];
    res.json(utxos);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

async function postTx(req, res) {
  try {
    const { body } = req;
    if (!body) {
      res.sendStatus(400);
      return;
    }
    const tx = await cardanoSubmitTxService.postTx(body);
    res.json(tx);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

module.exports = {
  getTxs,
  getBalances,
  getUtxos,
  postTx,
};
