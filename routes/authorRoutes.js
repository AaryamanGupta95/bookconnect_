const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const asyncHandler = require('../utils/asyncHandler');

// Author profile page
router.get('/:authorName', asyncHandler(authorController.getAuthorProfile));

module.exports = router;













