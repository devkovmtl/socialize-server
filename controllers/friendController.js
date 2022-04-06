const { getUserIdFromReq } = require('../utils/getUserIdFromReq');
const FriendRequest = require('../models/friendRequest');

exports.getFriendRequests = async (req, res, next) => {
  const userId = getUserIdFromReq(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [{ msg: 'Unauthorized' }],
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
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [{ msg: 'Unauthorized' }],
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

exports.updateFriendRequest = async (req, res, next) => {
  const userId = getUserIdFromReq(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [{ msg: 'Unauthorized' }],
    });
  }
  const { friendReqId } = req.params;
  const { status } = req.body;

  if (!friendReqId) {
    return res.status(422).json({
      success: false,
      message: 'Friend request id is required',
      errors: [{ msg: 'Friend request id is required' }],
    });
  }

  if (!status) {
    return res.status(422).json({
      success: false,
      message: 'Status is required',
      errors: [{ msg: 'Status is required' }],
    });
  }

  if (!['accepted', 'rejected', 'blocked'].includes(status)) {
    return res.status(422).json({
      success: false,
      message: 'Status must be accepted, rejected or blocked',
      errors: [{ msg: 'Status must be accepted, rejected or blocked' }],
    });
  }

  try {
    const friendRequest = await FriendRequest.findById(friendReqId);

    if (!friendRequest) {
      return res.status(422).json({
        success: false,
        message: 'Friend request not found',
        errors: [{ msg: 'Friend request not found' }],
      });
    }
    // make sure that the user is the receiver of the friend request
    if (friendRequest.receiver.toString() !== userId) {
      return res.status(422).json({
        success: false,
        message: 'You are not allowed to update this friend request',
        errors: [{ msg: 'You are not allowed to update this friend request' }],
      });
    }
    // update freind request status
    friendRequest.status = status;
    await friendRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Friend request updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
