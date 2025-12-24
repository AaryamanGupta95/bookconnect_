const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.isAdmin) return res.redirect('/admin');
    return res.redirect('/books');
  }
  // show minimal login page
  return res.redirect('/login');
}));

// Change /signup to /register
router.get('/register', authController.showSignup);
router.post('/register', authController.signup);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;