const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// List books with optional filters
router.get('/', bookController.listBooks);

// Show book detail and reviews
router.get('/:id', bookController.showBook);

module.exports = router;
