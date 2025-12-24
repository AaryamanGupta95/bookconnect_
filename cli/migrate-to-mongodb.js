/**
 * Migration Script: MySQL to MongoDB
 * 
 * This script migrates all data from MySQL to MongoDB
 * Run this ONCE after setting up MongoDB
 * 
 * Usage: node cli/migrate-to-mongodb.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_connect';
const mongoose = require('mongoose');

// Import MongoDB models (they will register with mongoose)
require('../models-mongo/userModel');
require('../models-mongo/bookModel');
require('../models-mongo/reviewModel');

// MySQL connection
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

async function migrateUsers() {
  console.log('📦 Migrating users...');
  const [users] = await mysqlPool.execute('SELECT * FROM users');
  const User = mongoose.model('User');
  
  for (const user of users) {
    try {
      await User.create({
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    } catch (error) {
      if (error.code === 11000) {
        console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
      } else {
        console.error(`  ❌ Error migrating user ${user.email}:`, error.message);
      }
    }
  }
  console.log(`  ✅ Migrated ${users.length} users`);
}

async function migrateBooks() {
  console.log('📦 Migrating books...');
  const [books] = await mysqlPool.execute('SELECT * FROM books');
  const Book = mongoose.model('Book');
  
  for (const book of books) {
    try {
      await Book.create({
        title: book.title,
        authors: book.authors || '',
        isbn: book.isbn || null,
        cover_url: book.cover_url || null,
        views: book.views || 0,
        createdAt: book.created_at,
        updatedAt: book.updated_at
      });
    } catch (error) {
      console.error(`  ❌ Error migrating book ${book.title}:`, error.message);
    }
  }
  console.log(`  ✅ Migrated ${books.length} books`);
}

async function migrateReviews() {
  console.log('📦 Migrating reviews...');
  const [reviews] = await mysqlPool.execute('SELECT * FROM reviews');
  const Review = mongoose.model('Review');
  
  for (const review of reviews) {
    try {
      await Review.create({
        user_id: review.user_id.toString(),
        book_id: review.book_id.toString(),
        rating: review.rating,
        content: review.content,
        createdAt: review.created_at,
        updatedAt: review.updated_at || review.created_at
      });
    } catch (error) {
      console.error(`  ❌ Error migrating review ${review.id}:`, error.message);
    }
  }
  console.log(`  ✅ Migrated ${reviews.length} reviews`);
}

async function migrate() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Wait a moment for models to register
    await new Promise(resolve => setTimeout(resolve, 100));

    // Migrate in order: Users -> Books -> Reviews
    await migrateUsers();
    await migrateBooks();
    await migrateReviews();

    console.log('\n✅ Migration completed successfully!');
    console.log('📝 You can now switch to MongoDB by updating your models.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    await mysqlPool.end();
    console.log('\n🔌 Connections closed');
  }
}

// Run migration
migrate();

