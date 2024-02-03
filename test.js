const service = require('./src/services/cardanoBalancesService');

service.getBalancesForAddress('addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu', 50).then((data) => console.log(JSON.stringify(data))).catch(console.error);
