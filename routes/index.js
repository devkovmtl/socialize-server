const { Router } = require('express');
const router = Router();

const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const friendController = require('../controllers/friendController');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
  });
});

/**
 * Friends request
 */
router.post(
  '/friends/request',
  isAuthenticated,
  friendController.sendFriendRequest
);

/**
 * Authentication routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/checkAccessToken', authController.checkAccessToken);
// facebook login
router.get('/login/facebook', authController.facebookLogin);
router.get('/redirect/facebook', authController.facebookCallback);

module.exports = router;
