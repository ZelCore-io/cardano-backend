const log = require('../lib/log');

// Allowed user agent patterns
const ALLOWED_USER_AGENTS = [
  /axios\//i, // Matches axios/x.x.x
  /uptime-kuma\//i, // Matches Uptime-Kuma/x.x.x
  /zelcore\//i, // Matches ZelCore in user agent string
];

/**
 * Middleware to validate that requests come from authorized sources
 * by checking the User-Agent header or ZelCore/ZelID headers
 */
// eslint-disable-next-line consistent-return
const validateUserAgent = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  const zelcoreHeader = req.get('zelcore');
  const zelidHeader = req.get('zelid');

  log.info(`[AUTH CHECK] Path: ${req.path}, IP: ${req.ip}, UA: "${userAgent}", zelcore: ${!!zelcoreHeader}, zelid: ${!!zelidHeader}`);

  // Allow if ZelCore or ZelID header is present
  if (zelcoreHeader || zelidHeader) {
    log.info(`[AUTH SUCCESS] Authorized via ${zelcoreHeader ? 'zelcore' : 'zelid'} header from ${req.ip}`);
    return next();
  }

  // Check if user agent exists
  if (!userAgent) {
    log.warn(`[AUTH BLOCKED] Missing User-Agent header from ${req.ip} for ${req.path}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied.',
    });
  }

  // Check if user agent matches any allowed pattern
  const isAllowed = ALLOWED_USER_AGENTS.some((pattern) => pattern.test(userAgent));

  if (!isAllowed) {
    log.warn(`[AUTH BLOCKED] Unauthorized User-Agent "${userAgent}" from ${req.ip} for ${req.path} - STOPPING REQUEST`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied.',
    });
  }

  // User agent is valid, proceed to next middleware
  log.info(`[AUTH SUCCESS] Valid User-Agent "${userAgent}" from ${req.ip}`);
  next();
};

module.exports = validateUserAgent;
