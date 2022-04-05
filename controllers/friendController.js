const { getUserIdFromReq } = require('../utils/getUserIdFromReq');
const FriendRequest = require('../models/friendRequest');

exports.getFriendRequests = async (req, res, next) => {
  const userId = getUserIdFromReq(req);

  if (!userId) {
    return res.status(422).json({
      success: false,
      message: 'User id is required',
      errors: [{ msg: 'User id is required' }],
    });
  }

  try {
    const friendRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name username')
      .populate('receiver', 'name username');

    return res.status(200).json({
      success: true,
      message: 'Friend requests fetched successfully',
      data: friendRequests,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendFriendRequest = async (req, res, next) => {
  const userId = getUserIdFromReq(req);
  const { friendId } = req.body;

  if (!userId) {
    return res.status(422).json({
      success: false,
      message: 'User id is required',
      errors: [{ msg: 'User id is required' }],
    });
  }

  if (!friendId) {
    return res.status(422).json({
      success: false,
      message: 'Friend id is required',
      errors: [{ msg: 'Friend id is required' }],
    });
  }

  if (userId === friendId) {
    return res.status(422).json({
      success: false,
      message: 'You cannot send friend request to yourself',
      errors: [{ msg: 'You cannot send friend request to yourself' }],
    });
  }
  try {
    const areAlreadyFriends = await FriendRequest.findOne({
      $or: [
        {
          $or: [
            { sender: userId, receiver: friendId, status: 'accepted' },
            { sender: friendId, receiver: userId, status: 'accepted' },
          ],
        },
        {
          $or: [
            { sender: userId, receiver: friendId, status: 'blocked' },
            { sender: friendId, receiver: userId, status: 'blocked' },
          ],
        },
      ],
    });

    if (areAlreadyFriends) {
      return res.status(422).json({
        success: false,
        message: 'You are already friends',
        errors: [{ msg: 'You are already friends' }],
      });
    }

    await FriendRequest.create({
      sender: userId,
      receiver: friendId,
    });

    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
    });
  } catch (error) {
    next(error);
  }
};
