const express = require("express");
const { createPost, getPosts, getPostById } = require("../controllers/PostCreator");
const upload = require("../middleware/multur");

const router = express.Router();

router.get("/", getPosts);

router.get("/:id", getPostById);
router.post("/", upload.single("photo"), createPost);

// Engagement routes
const { isAuthenticatedUser } = require("../middleware/auth");
router.post("/:id/like", isAuthenticatedUser, require("../controllers/PostCreator").toggleLikePost);
router.post("/:id/comment", isAuthenticatedUser, require("../controllers/PostCreator").addCommentToPost);

module.exports = router;
