const dbsecrets = require('./dbsecrets');
const apisecrets = require('./apisecrets');

module.exports = {
  server: {
    port: 9876,
  },
  database: {
    url: '127.0.0.1',
    port: 27017,
    database: dbsecrets.dbname,
    username: dbsecrets.dbusername,
    password: dbsecrets.dbpassword,
  },
  collections: {
    txs: 'txs',
  },
  apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
  apiSecret: apisecrets.projectid,
};
