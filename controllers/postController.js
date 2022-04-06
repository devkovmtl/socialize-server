const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const FriendsRequest = require('../models/friendRequest');
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

// get post from current user and friends of current user
exports.getUserAndFriendsPosts = async (req, res, next) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [{ msg: 'Unauthorized' }],
    });
  }

  try {
    // Grab user that are friends with current user
    const friends = await FriendsRequest.find({
      $or: [
        {
          sender: userId, // current user
          status: 'accepted',
        },
        {
          receiver: userId, // current user
          status: 'accepted',
        },
      ],
    });
    // take only the id of the friends
    let onlyIds = friends.map((friend) => {
      let id;
      if (userId === friend.sender.toString()) {
        id = friend.receiver;
      } else {
        id = friend.sender;
      }

      return id;
    });
    // Grab only the posts  belong to the current user
    const userPost = await Post.find({
      author: userId,
    }).sort({ updatedAt: -1, createdAt: -1 });
    //  Grab post that belong to user friends that are public or visible by friends
    const friendsPost = await Post.find({
      author: { $in: [...onlyIds] },
      visibility: { $not: { $eq: 'private' } },
    })
      .populate('author', 'username')
      .sort({ updatedAt: -1, createdAt: -1 });

    const posts = [...userPost, ...friendsPost]
      .sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      )
      .reverse();

    return res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      posts,
    });
  } catch (error) {
    return next(error);
  }
};
