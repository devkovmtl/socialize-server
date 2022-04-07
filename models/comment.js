const { Schema, model } = require('mongoose');

const CommentSchema = new Schema(
  {
    content: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  { timestamps: true }
);

module.exports = model('Comment', CommentSchema);
