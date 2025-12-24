const mongoose = require('mongoose');
const { Schema } = mongoose;

// User Schema (equivalent to MySQL users table)
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  password_hash: {
    type: String,
    required: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users' // Collection name in MongoDB
});

// Note: unique: true already creates indexes, so no need for explicit index() calls

const User = mongoose.model('User', userSchema);

// Model methods (matching your existing interface)
async function createUser({ username, email, passwordHash }) {
  const user = new User({
    username,
    email,
    password_hash: passwordHash
  });
  await user.save();
  return user._id.toString(); // Return as string to match MySQL behavior
}

async function findByEmail(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  
  // Convert to format matching MySQL result
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    password_hash: user.password_hash,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
}

async function countAll() {
  return await User.countDocuments();
}

async function getAll() {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(user => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  }));
}

module.exports = { createUser, findByEmail, countAll, getAll, User };

