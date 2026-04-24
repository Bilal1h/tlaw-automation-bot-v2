const { tokensExist } = require('../utils/tokenStore');

function authCheck(req, res, next) {
  if (!tokensExist()) {
    return res.status(401).json({
      error: 'Not authenticated. Visit /auth/google first.',
    });
  }
  return next();
}

module.exports = { authCheck };

