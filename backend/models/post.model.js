import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
  },
  { timestamps: true }
);

// Virtual to create reverse relation for comments
postSchema.virtual('comments', {
  ref: 'Comment', // The model to use
  localField: '_id', // Find comments where `post._id` matches `comment.post`
  foreignField: 'post', // The field in the Comment model that refers to Post
  justOne: false, // Set to false since we want to retrieve multiple comments
});

// Ensure virtuals are included when converting documents to JSON or Object
postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
