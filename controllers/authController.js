const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/user');
const { generateJwtToken } = require('../utils/auth');

exports.register = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email is required'),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage('Password must contain at least one letter and one number')
    .escape(),
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Registration failed',
        errors: errors.array(),
      });
    }

    try {
      const userEmailTaken = await User.findOne({ email: req.body.email });
      if (userEmailTaken) {
        return res.status(422).json({
          success: false,
          message: 'Registration failed',
          errors: [
            {
              msg: 'Email already exists',
            },
          ],
        });
      }
      const userUsernameTaken = await User.findOne({
        username: req.body.username,
      });
      if (userUsernameTaken) {
        return res.status(422).json({
          success: false,
          message: 'Registration failed',
          errors: [
            {
              msg: 'Username already exists',
            },
          ],
        });
      }
      const user = await User.create(req.body);

      // generate a token
      const accessToken = generateJwtToken(user);
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
    } catch (error) {
      return next(error);
    }
  },
];

exports.login = [
  async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: info.message || 'Login failed',
          errors: [{ msg: err.message || 'Login failed' }],
        });
      }

      if (!user) {
        return res.status(422).json({
          success: false,
          message: info.message || 'Login failed',
          errors: [{ msg: info.message || 'Login failed' }],
        });
      }

      // generate a signed json web token with the contents of user object and return it in the response
      const accessToken = generateJwtToken(user);

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
    })(req, res, next);
  },
];
