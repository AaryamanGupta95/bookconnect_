const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../utils/authMiddleware');

// Show chat page
router.get('/', requireAuth, chatController.showChat);

module.exports = router;













