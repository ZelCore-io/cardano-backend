const service = require('./src/services/cardanoTxsService');

service.getTxsForAddress('addr1qyex876krf63jmu2s0mrt0wjvlqe754ksy0gp7x3v0g92svgyjxzpkd9pspfrcxps6l0s25prxmy7mjqu9vvvc2w4x5sgk8tzj', 50).then((data) => console.log(JSON.stringify(data))).catch(console.error);
