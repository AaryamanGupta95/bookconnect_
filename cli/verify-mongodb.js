/**
 * Verify MongoDB Database Structure
 * 
 * This script checks if your MongoDB database is set up correctly
 * and shows you what's in it.
 * 
 * Usage: node cli/verify-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models to register them
require('../models-mongo/userModel');
require('../models-mongo/bookModel');
require('../models-mongo/reviewModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_connect';

async function verify() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log(`📊 Database: ${dbName}\n`);
    console.log('📦 Collections:\n');

    // List all collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('  ⚠️  No collections found. Database is empty.');
      console.log('  💡 Run the migration script or start using the app to create data.\n');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  ✅ ${collection.name}: ${count} documents`);
      }
      console.log('');
    }

    // Show sample data
    const User = mongoose.model('User');
    const Book = mongoose.model('Book');
    const Review = mongoose.model('Review');

    console.log('📄 Sample Data:\n');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      const sampleUser = await User.findOne();
      console.log('  👤 Sample User:');
      console.log(`     Username: ${sampleUser.username}`);
      console.log(`     Email: ${sampleUser.email}`);
      console.log(`     ID: ${sampleUser._id}`);
      console.log('');
    }

    const bookCount = await Book.countDocuments();
    if (bookCount > 0) {
      const sampleBook = await Book.findOne();
      console.log('  📚 Sample Book:');
      console.log(`     Title: ${sampleBook.title}`);
      console.log(`     Author: ${sampleBook.authors || 'Unknown'}`);
      console.log(`     Views: ${sampleBook.views || 0}`);
      console.log(`     ID: ${sampleBook._id}`);
      console.log('');
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount > 0) {
      const sampleReview = await Review.findOne();
      console.log('  ⭐ Sample Review:');
      console.log(`     Rating: ${sampleReview.rating}/5`);
      console.log(`     Content: ${sampleReview.content.substring(0, 50)}...`);
      console.log(`     ID: ${sampleReview._id}`);
      console.log('');
    }

    // Statistics
    console.log('📈 Statistics:\n');
    console.log(`  Total Users: ${userCount}`);
    console.log(`  Total Books: ${bookCount}`);
    console.log(`  Total Reviews: ${reviewCount}`);
    console.log('');

    if (userCount === 0 && bookCount === 0 && reviewCount === 0) {
      console.log('💡 Next Steps:');
      console.log('   1. If you have MySQL data, run: node cli/migrate-to-mongodb.js');
      console.log('   2. Or start using the app to create data automatically\n');
    }

    console.log('✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. MongoDB is running');
    console.error('   2. MONGODB_URI is correct in .env file');
    console.error('   3. MongoDB is accessible at the specified address\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

verify();

