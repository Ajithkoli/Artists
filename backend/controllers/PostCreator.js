const Post = require("../models/PostCreator");

const createPost = async (req, res) => {
  try {
    const { title, description, story, tags } = req.body;

    if (!req.file) return res.status(400).json({ error: "Photo is required" });
    if (!title || !description || !story) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const post = new Post({
      photoUrl: req.file.path,
      title,
      description,
      story,
      story,
      tags: JSON.parse(tags), // comes as string from frontend
      user: req.user.id
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('likes', 'name email')
      .populate('comments.user', 'name email');

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id.toString());
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const addCommentToPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text: text
    });

    await post.save();

    // Populate the newly added comment's user before sending response
    const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'name email');

    res.json({ success: true, comments: updatedPost.comments });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createPost, getPosts, getPostById, toggleLikePost, addCommentToPost };
