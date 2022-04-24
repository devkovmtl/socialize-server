const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      '-password -__v -firstName -lastName -birthdate -isVerified -role -registrationDate -provider -facebookId'
    );
    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    return next(error);
  }
};
