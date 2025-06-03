const helmet = require('helmet');

const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only app
  hsts: false, // Disable HSTS since we're not using HTTPS
});

module.exports = helmetMiddleware;
