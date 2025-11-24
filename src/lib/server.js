const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validateUserAgent = require('../middleware/userAgentValidator');

const nodeEnv = process.env.NODE_ENV;

const app = express();

// Trust proxy - we're behind HAProxy and Cloudflare
// Trust only the first proxy (HAProxy) to read real client IP from X-Forwarded-For header
app.set('trust proxy', 1);

// Rate limiting: 1000 requests per day per IP
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 24 hours',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors());
app.use(limiter);
app.use(validateUserAgent); // Validate user agent before processing requests
require('../routes')(app);

module.exports = app;
