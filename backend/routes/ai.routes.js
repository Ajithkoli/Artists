const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { isAuthenticatedUser } = require('../middleware/auth');

// Public endpoint: allow guests to use the AI proxy
router.post('/chat', aiController.chat);

module.exports = router;
