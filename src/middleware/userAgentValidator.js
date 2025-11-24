const log = require('../lib/log');

// Allowed user agent patterns
const ALLOWED_USER_AGENTS = [
  /axios\//i, // Matches axios/x.x.x
  /uptime-kuma\//i, // Matches Uptime-Kuma/x.x.x
  /zelcore\//i, // Matches ZelCore in user agent string
];

/**
 * Middleware to validate that requests come from authorized sources
 * by checking the User-Agent header
 */
// eslint-disable-next-line consistent-return
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');

  // Check if user agent exists
  if (!userAgent) {
    log.warn(`Request blocked: Missing User-Agent header from ${req.ip}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied.',
    });
  }

  // Check if user agent matches any allowed pattern
  const isAllowed = ALLOWED_USER_AGENTS.some((pattern) => pattern.test(userAgent));

  if (!isAllowed) {
    log.warn(`Request blocked: Unauthorized User-Agent "${userAgent}" from ${req.ip}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied.',
    });
  }

  // User agent is valid, proceed to next middleware
  next();
};

module.exports = validateUserAgent;
