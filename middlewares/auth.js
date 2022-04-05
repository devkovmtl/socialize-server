const passport = require('passport');
const { userTokenInfo } = require('../utils/auth');

exports.isAuthenticated = async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: info.message || 'Check access token failed',
        errors: [{ msg: err.message || 'Check access token failed' }],
      });
    }
    if (!user) {
      return res.status(422).json({
        success: false,
        message: info.message || 'Check access token failed',
        errors: [{ msg: info.message || 'Check access token failed' }],
      });
    }

    // req.user = userTokenInfo(user);

    return next();
  })(req, res, next);
};

exports.isAdmin = async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: info.message || 'Check access token failed',
        errors: [{ msg: err.message || 'Check access token failed' }],
      });
    }
    if (!user) {
      return res.status(422).json({
        success: false,
        message: info.message || 'Check access token failed',
        errors: [{ msg: info.message || 'Check access token failed' }],
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action',
        errors: [{ msg: 'You are not authorized to perform this action' }],
      });
    }

    // req.user = userTokenInfo(user);

    return next();
  })(req, res, next);
};
