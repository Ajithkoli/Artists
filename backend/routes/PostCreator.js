const express = require("express");
const {
    createPost,
    getPosts,
    getPostById,
    toggleLikePost,
    addCommentToPost
} = require("../controllers/PostCreator");
const upload = require("../middleware/multur");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.get("/", getPosts);

router.get("/:id", getPostById);
router.post("/", isAuthenticatedUser, upload.single("photo"), createPost);

// Engagement routes
router.post("/:id/like", isAuthenticatedUser, toggleLikePost);
router.post("/:id/comment", isAuthenticatedUser, addCommentToPost);

module.exports = router;
