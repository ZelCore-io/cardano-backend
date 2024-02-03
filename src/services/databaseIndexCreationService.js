const config = require('config');

const serviceHelper = require('./serviceHelper');
const log = require('../lib/log');

async function doIndexes() {
  try {
    log.info('Creating collection indexes');
    const db = await serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.txs).createIndex({ hash: 1 });

    log.info('Collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

module.exports = {
  doIndexes,
};
