const bookModel = require('../models-mongo/bookModel');
const reviewModel = require('../models-mongo/reviewModel');
const { generateCertificate } = require('../utils/certGenerator');

/**
 * List all reviews with user and book information
 */
exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await reviewModel.getAllWithUserAndBook();
    res.render('reviews', { reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    next(err);
  }
};

/**
 * Show the add review form
 */
exports.showAdd = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    // Allow prefill from querystring (e.g. /reviews/add?title=...)
    const formData = {
      title: req.query.title ? decodeURIComponent(req.query.title) : ''
    };
    res.render('addReview', { 
      error: null, 
      formData
    });
  } catch (err) {
    console.error('Error showing add review form:', err);
    next(err);
  }
};

/**
 * Add a new review
 */
exports.addReview = async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { title, rating, content } = req.body;

    // Input validation
    if (!title || !rating || !content) {
      return res.status(400).render('addReview', {
        error: 'Title, rating, and content are required fields',
        formData: req.body
      });
    }

    // Validate rating is a number between 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).render('addReview', {
        error: 'Rating must be a number between 1 and 5',
        formData: req.body
      });
    }

    // Find or create the book in DB
    const bookId = await bookModel.findOrCreate({
      title: title.trim(),
      authors: '',
      isbn: null
    });

    // Check if this is the user's first review
    const userReviewCount = await reviewModel.countByUserId(req.session.user.id);
    const isUserFirstReview = userReviewCount === 0;
    
    // Save the review with username
    await reviewModel.create({
      user_id: req.session.user.id,
      username: req.session.user.username,
      book_id: bookId,
      rating: ratingNum,
      content: content.trim()
    });

    // Generate HTTPS certificate ONCE when first review is submitted (if certificates don't exist)
    const fs = require('fs');
    const path = require('path');
    const certsDir = path.join(__dirname, '..', 'certs');
    const keyPath = process.env.SSL_KEY || path.join(certsDir, 'localhostkey.pem');
    const certPath = process.env.SSL_CERT || path.join(certsDir, 'localhostcert.pem');
    
    // Check if certificates already exist - only generate ONCE
    const certsExist = fs.existsSync(keyPath) && fs.existsSync(certPath);
    
    if (!certsExist) {
      try {
        console.log('🔐 Generating HTTPS certificate for the site...');
        console.log('   This will create ONE certificate for the entire site');
        
        // Generate certificate (creates ONE certificate, not per user)
        const result = generateCertificate();
        
        console.log('✅ SSL certificate generated successfully!');
        console.log(`   Certificate: ${result.certPath}`);
        console.log(`   Private Key: ${result.keyPath}`);
        console.log('   📝 Note: Restart the server to enable HTTPS.');
        console.log('   The server will automatically use HTTPS on next startup.');
      } catch (certError) {
        console.error('⚠️  Could not generate HTTPS certificate:', certError.message);
        console.error('   Continuing with HTTP for now.');
        console.error('   Error details:', certError.stack);
      }
    }

    // Previously invalidated Redis review caches here (now removed)

    // Emit socket event for real-time updates
    try {
      const io = req.app.locals.io;
      if (io) io.emit('new-review', { bookId, rating: ratingNum });
    } catch (emitErr) {
      console.error('Socket emit error:', emitErr);
    }

    res.redirect('/reviews');
  } catch (err) {
    console.error('Error adding review:', err);
    next(err);
  }
};

exports.listMine = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const reviews = await reviewModel.getByUserId(userId);
    res.render('myReviews', { reviews });
  } catch (err) {
    next(err);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const reviewId = req.params.id;
    const review = await reviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.user_id !== req.session.user.id) {
      return res.status(403).render('error', { error: { message: 'Forbidden' } });
    }
    
    // Get book info
    const book = await bookModel.findById(review.book_id);
    res.render('editReview', { 
      error: null, 
      review,
      book,
      formData: {
        rating: review.rating,
        content: review.content
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const reviewId = req.params.id;
    const review = await reviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.user_id !== req.session.user.id) {
      return res.status(403).render('error', { error: { message: 'Forbidden' } });
    }
    
    const { rating, content } = req.body;
    
    if (!rating || !content) {
      const book = await bookModel.findById(review.book_id);
      return res.status(400).render('editReview', {
        error: 'Rating and content are required',
        review,
        book,
        formData: req.body
      });
    }
    
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      const book = await bookModel.findById(review.book_id);
      return res.status(400).render('editReview', {
        error: 'Rating must be a number between 1 and 5',
        review,
        book,
        formData: req.body
      });
    }
    
    await reviewModel.update(reviewId, {
      rating: ratingNum,
      content: content.trim()
    });
    
    // Previously invalidated Redis review caches here (now removed)
    
    res.redirect('/reviews/mine');
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const reviewId = req.params.id;
    const review = await reviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user owns this review or is admin
    if (review.user_id !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await reviewModel.delete(reviewId);
    
    // Previously invalidated Redis review caches here (now removed)
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};