const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const { getUserIdFromReq } = require('../utils/getUserIdFromReq');

exports.createPost = [
  body('content')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Content is required')
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: errors.array()[0].msg || 'Something went wrong',
        errors: errors.array(),
      });
    }
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errors: [{ msg: 'Unauthorized' }],
      });
    }

    if (
      req.body.visibility &&
      !['public', 'private', 'friends'].includes(req.body.visibility)
    ) {
      return res.status(422).json({
        success: false,
        message: 'Visibility must be public, private or friends',
        errors: [{ msg: 'Visibility must be public, private or friends' }],
      });
    }

    try {
      const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        author: userId,
        visibility: req.body.visibility,
      });

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: post,
      });
    } catch (error) {
      return next(error);
    }
  },
];
