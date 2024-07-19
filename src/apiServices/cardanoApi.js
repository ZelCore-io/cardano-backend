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
    if (limit > 10000) {
      limit = 10000;
    }
    const txs = await cardanoTxsService.getTxsForAddress(address, limit) || [];
    res.json(txs);
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message === 'The requested component has not been found.') {
      res.json([]);
      return;
    }
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
    const txs = await cardanoBalanceService.getBalancesForAddress(address) || { amount: [] };
    res.json(txs);
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message === 'The requested component has not been found.') {
      res.json({ amount: [] });
      return;
    }
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
    if (error.response && error.response.data && error.response.data.message === 'The requested component has not been found.') {
      res.json([]);
      return;
    }
    log.error(error);
    res.sendStatus(404);
  }
}

async function postTx(req, res) {
  try {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', async () => {
      try {
        if (!body) {
          throw new Error('Invalid request');
        }
        const tx = await cardanoSubmitTxService.submitTx(body);
        res.json(tx);
      } catch (error) {
        log.error(error);
        if (error?.response?.data?.message) {
          log.error(error.response.data.message);
          res.status(400).send(error.response.data.message);
          return;
        }
        res.sendStatus(400);
      }
    });
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
