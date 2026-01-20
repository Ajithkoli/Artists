const express = require("express");
const {
    createPost,
    getPosts,
    getPostById,
    toggleLikePost,
    addCommentToPost,
    deletePost,
    getMyPosts
} = require("../controllers/PostCreator");
const upload = require("../middleware/multur");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.get("/", getPosts);

// Get own posts
router.get("/my-posts", isAuthenticatedUser, getMyPosts);

router.get("/:id", getPostById);
router.post("/", isAuthenticatedUser, upload.single("photo"), createPost);
router.delete("/:id", isAuthenticatedUser, deletePost);

// Engagement routes
router.post("/:id/like", isAuthenticatedUser, toggleLikePost);
router.post("/:id/comment", isAuthenticatedUser, addCommentToPost);

module.exports = router;
