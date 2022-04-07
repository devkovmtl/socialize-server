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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// get the likes
PostSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
});

// get the totals likes
PostSchema.virtual('totalLikes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
  count: true,
});

module.exports = model('Post', PostSchema);
