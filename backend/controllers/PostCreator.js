const Post = require("../models/PostCreator");

const createPost = async (req, res) => {
  try {
    const { title, description, story, tags } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: "Photo is required" });
    if (!title || !description || !story) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        console.error("Error parsing tags:", e);
        parsedTags = [];
      }
    }

    const post = new Post({
      photoUrl: req.file.path,
      title,
      description,
      story,
      tags: parsedTags,
      user: req.user.id
    });

    const savedPost = await post.save();
    res.status(201).json({ success: true, post: savedPost });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name specialization avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error("Get Posts Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name specialization avatar bio')
      .populate('likes', 'name email')
      .populate('comments.user', 'name email avatar');

    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("Get Post By ID Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (err) {
    console.error("Toggle Like Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text: text
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'name email avatar');

    res.json({ success: true, comments: updatedPost.comments });
  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

module.exports = { createPost, getPosts, getPostById, toggleLikePost, addCommentToPost };
