const express = require('express');
const router = express.Router();
const reviewModel = require('../models-mongo/reviewModel');
const bookModel = require('../models-mongo/bookModel');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reviews - all users (no Redis cache)
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAllWithUserAndBook();
    res.json(reviews);
  } catch (err) { next(err); }
});

// GET /api/books - all books (no Redis cache)
router.get('/books', asyncHandler(async (req, res) => {
  const books = await bookModel.getAll();
  res.json(books);
}));

module.exports = router;
