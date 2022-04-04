const { Router } = require('express');
const router = Router();

const authController = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.get('/', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
  });
});

/**
 * Authentication routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/checkAccessToken', authController.checkAccessToken);
module.exports = router;
