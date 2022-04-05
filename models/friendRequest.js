const { Schema, model } = require('mongoose');

const FriendRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    askedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model('FriendRequest', FriendRequestSchema);
