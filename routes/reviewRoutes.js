const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../utils/authMiddleware');

// Show all reviews
router.get('/', asyncHandler(reviewController.listReviews));

// Show only logged-in user's reviews
router.get('/mine', requireAuth, asyncHandler(reviewController.listMine));

// Show add review form
router.get('/add', asyncHandler(reviewController.showAdd));

// Show edit review form
router.get('/edit/:id', requireAuth, asyncHandler(reviewController.showEdit));

// Submit new review
router.post('/', asyncHandler(reviewController.addReview));

// Update review
router.post('/edit/:id', requireAuth, asyncHandler(reviewController.updateReview));

// Delete review
router.delete('/:id', requireAuth, asyncHandler(reviewController.deleteReview));

module.exports = router;