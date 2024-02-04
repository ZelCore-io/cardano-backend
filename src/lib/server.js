const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
bodyParser.cbor = require('cbor-body-parser');

const nodeEnv = process.env.NODE_ENV;

const app = express();

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.cbor({ limit: '1000kB' }));
require('../routes')(app);

module.exports = app;
