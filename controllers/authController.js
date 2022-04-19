const path = require('path');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const multer = require('multer');
const DatauriParser = require('datauri/parser');
const User = require('../models/user');
const { generateJwtToken } = require('../utils/auth');
const cloudinary = require('../config/cloudinaryConfig');
const fileFilter = require('../utils/imageFileFilter');

// config multer
const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter });

exports.register = [
  upload.single('avatar'),
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
        message: errors.array()[0]['msg'] || 'Registration failed',
        errors: errors.array(),
      });
    }

    try {
      const userEmailTaken = await User.findOne({ email: req.body.email });
      if (userEmailTaken) {
        return res.status(422).json({
          success: false,
          message: 'Email already exists',
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
          message: 'Username already exists',
          errors: [
            {
              msg: 'Username already exists',
            },
          ],
        });
      }

      // user avatar
      let avatar = '';

      if (req.file) {
        // upload file avatar to cloudinary
        const parser = new DatauriParser();
        const extensionName = path.extname(req.file.originalname).toString();
        const file64 = parser.format(extensionName, req.file.buffer);
        const result = await cloudinary.v2.uploader.upload(file64.content, {
          folder: 'social/avatars',
        });

        avatar = result.secure_url;
      }

      const user = await User.create({
        avatar:
          avatar === ''
            ? 'https://res.cloudinary.com/devkovmtl/image/upload/v1650380987/default_avatar.jpg'
            : avatar,
        ...req.body,
      });

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
          message: info?.message || 'Login failed',
          errors: [{ msg: err?.message || 'Login failed' }],
        });
      }

      if (!user) {
        return res.status(422).json({
          success: false,
          message: info?.message || 'Login failed',
          errors: [{ msg: info?.message || 'Login failed' }],
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

exports.checkAccessToken = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
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

    if (user) {
      return res.json({
        success: true,
        message: 'Check access token successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken: generateJwtToken(user),
      });
    }
  })(req, res, next);
};

exports.facebookLogin = passport.authenticate('facebook', {
  scope: ['email', 'public_profile'],
});

exports.facebookCallback = async (req, res, next) => {
  passport.authenticate(
    'facebook',
    {
      session: false,
      successRedirect: '/api/v1/',
    },
    (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: (info && info.message) || 'Facebook login failed',
          errors: [{ msg: err.message || 'Facebook login failed' }],
        });
      }

      if (!user) {
        return res.status(422).json({
          success: false,
          message: (info && info.message) || 'Facebook login failed',
          errors: [{ msg: (info && info.message) || 'Facebook login failed' }],
        });
      }

      const accessToken = generateJwtToken(user);

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user?.email,
          role: user.role,
        },
        accessToken,
      });
    }
  )(req, res, next);
};
