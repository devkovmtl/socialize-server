const { Router } = require('express');
const router = Router();

const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const friendController = require('../controllers/friendController');
const postController = require('../controllers/postController');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
  });
});

/**
 * Post routes
 */
// create a post
router.post('/posts', isAuthenticated, postController.createPost);
// get post from current user and friends of current user
router.get('/posts', isAuthenticated, postController.getUserAndFriendsPosts);

/**
 * Friends routes
 */
router.post(
  '/friends/request',
  isAuthenticated,
  friendController.sendFriendRequest
);
router.put(
  '/friends/request/:friendReqId',
  isAuthenticated,
  friendController.updateFriendRequest
);
router.get(
  '/friends/requests',
  isAuthenticated,
  friendController.getFriendRequests
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
