const bcrypt = require('bcrypt');
const userModel = require('../models-mongo/userModel');

const HOST_EMAIL = process.env.HOST_EMAIL || 'host@bookconnect.com';
const HOST_PASSWORD = process.env.HOST_PASSWORD || 'host123';

// Show registration form
exports.showSignup = (req, res) => res.render('register', { error: null });

// Handle registration
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
      return res.render('register', { error: 'All fields are required.' });
    }
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.render('register', { error: 'Email already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({ username, email, passwordHash: hash });
    const isAdmin = email === HOST_EMAIL || (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === email);
    req.session.user = { id: userId, username, email, isAdmin };
    res.redirect(isAdmin ? '/admin' : '/books');
  } catch (err) {
    next(err);
  }
};

// Show login form
exports.showLogin = (req, res) => res.render('login', { error: null });

// Handle login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Host credentials (hardcoded defaults with optional env override)
    if (email === HOST_EMAIL && password === HOST_PASSWORD) {
      req.session.user = { id: 0, username: 'host', email: HOST_EMAIL, isAdmin: true };
      return res.redirect('/admin');
    }
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    const isAdmin = user.email === HOST_EMAIL || (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === user.email);
    req.session.user = { id: user.id, username: user.username, email: user.email, isAdmin };
    res.redirect(isAdmin ? '/admin' : '/books');
  } catch (err) {
    next(err);
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};