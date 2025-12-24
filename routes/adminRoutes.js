const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const bookController = require('../controllers/bookController');
const adminController = require('../controllers/adminController');
const bookModel = require('../models-mongo/bookModel');
const { requireAdmin } = require('../utils/authMiddleware');

// Admin dashboard - simple list of books and recent reviews
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const books = await bookModel.getAll();
  res.render('adminDashboard', { books });
}));

router.get('/books/add', requireAdmin, bookController.showAddBook);
router.post('/books/add', requireAdmin, bookController.addBook);
router.delete('/books/:id', requireAdmin, bookController.deleteBook);

// API: delete a review
router.delete('/reviews/:id', requireAdmin, bookController.deleteReview);

router.get('/analytics', requireAdmin, asyncHandler(adminController.renderAnalytics));

module.exports = router;
