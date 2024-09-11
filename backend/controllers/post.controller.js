import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "./../models/notification.model.js";
import Follow from "../models/follow.model.js";
import Like from "./../models/like.model.js";
import Comment from "../models/comment.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found !" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image !" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in createPost controller", error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop()?.split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Like.deleteMany({ post: postId })

    await Comment.deleteMany({ post: postId })
    
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost controller", error);
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text)
      return res.status(400).json({ error: "Text field is required !" });

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found !" });

    const commentPost = new Comment({
      text: text,
      user: userId,
      post: postId
    })

    await commentPost.save();

    const updatedComments = await Comment.find({ post: { $in: postId }})
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "-password"
    })

    console.log(updatedComments);

    res.status(200).json(updatedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in commentOnPost controller", error);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found !" });

    const userLikedPost = await Like.findOne({ user: userId, post: postId });

    if (userLikedPost) {
      //unlike post
      await Like.findOneAndDelete({
        user: userId,
        post: postId,
      });

      return res.status(200).json({ message: "Post Unliked successfully" });
    } else {
      //like post
      const likePost = new Like({
        user: userId,
        post: postId,
      });

      await likePost.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      return res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likeUnlikePost controller", error);
  }
};

export const getMoreComments = async (req, res) => {
  const { postId, page = 1, limit = 10 } = req.query;

  try {
    const comments = await Comment.find({ post: postId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      });

    const totalComments = await Comment.countDocuments({ post: postId });

    res.status(200).json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getMoreComments controller", error);
  }
};


export const getAllPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)) 
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments",
        options: { limit: 10 },
        populate: {
          path: "user",
          select: "-password",
        },
      });

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getAllPosts controller", error);
  }
};


export const getLikedPosts = async (req, res) => {
  const userId = req.params.userid;

  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("user not found", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const totalPosts = await Like.countDocuments({ user: userId });

    if (totalPosts === 0) {
      return res.status(200).json({ message: "User didn't like any post" });
    }

    const likedPosts = await Like.find({ user: userId })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "-password",
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const populatedPosts = likedPosts.map((likePost) => likePost.post);

    return res.status(200).json({
      populatedPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getLikedPosts controller: ", error);
  }
};


export const getFollowingPosts = async (req, res) => {

  const userId = req.user._id;

  const { page = 1, limit = 10 } = req.query

  const skip = (page - 1) * limit;


  try {

    const followingUsers = await Follow.find({ followers: userId }).select(
      "following"
    );

    if (followingUsers.length === 0) {
      return res.status(200).json({ posts: [], message: "No following users" });
    }

    const followingIds = followingUsers.map(
      (followingUser) => followingUser.following
    );

    const totalPosts = await Post.countDocuments({ user: { $in: followingIds } })

    const feedPosts = await Post.find({ user: { $in: followingIds } })
      .populate({
        path: "user",
        select: "-password",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

      console.log(totalPosts)

    return res.status(200).json({
      feedPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getFollowingPosts controller: ", error);
  }
};

export const getUserPosts = async (req, res) => {

  const { username } = req.params;

  const { page = 1, limit = 10 } = req.query

  const skip = (page - 1) * limit;

  try {
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .populate({
        path: "user",
        select: "-password",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalPosts = await Post.countDocuments({ user: user._id })

    return res.status(200).json({
      posts,
      currentPage: page,
      totalPages : Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUserPosts controller: ", error);
  }
};
