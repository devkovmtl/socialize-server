const { Router } = require('express');
const router = Router();

const authController = require('../controllers/authController');

router.get('/', (req, res) => {
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

module.exports = router;
