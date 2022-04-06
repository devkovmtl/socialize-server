const { Schema, model } = require('mongoose');

const PostSchema = new Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public',
    },
  },
  { timestamps: true }
);

module.exports = model('Post', PostSchema);
