const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const bookController = require('../controllers/bookController');
const adminController = require('../controllers/adminController');
const bookModel = require('../models-mongo/bookModel');
const { requireAdmin } = require('../utils/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `book-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Admin dashboard - simple list of books and recent reviews
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const books = await bookModel.getAll();
  res.render('adminDashboard', { books });
}));

router.get('/books/add', requireAdmin, bookController.showAddBook);
router.post('/books/add', requireAdmin, upload.single('cover'), bookController.addBook);
router.delete('/books/:id', requireAdmin, bookController.deleteBook);

// API: delete a review
router.delete('/reviews/:id', requireAdmin, bookController.deleteReview);

router.get('/analytics', requireAdmin, asyncHandler(adminController.renderAnalytics));

module.exports = router;
