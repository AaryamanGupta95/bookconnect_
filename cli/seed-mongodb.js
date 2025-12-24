/**
 * Seed MongoDB Database with Sample Data
 * 
 * This script creates sample users, books, and reviews in your MongoDB database.
 * 
 * Usage: node cli/seed-mongodb.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Import models
const userModel = require('../models-mongo/userModel');
const bookModel = require('../models-mongo/bookModel');
const reviewModel = require('../models-mongo/reviewModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_connect';

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if data already exists
    const userCount = await userModel.countAll();
    const bookCount = await bookModel.countAll();
    
    if (userCount > 0 || bookCount > 0) {
      console.log('⚠️  Database already contains data!');
      console.log(`   Users: ${userCount}, Books: ${bookCount}\n`);
      console.log('💡 To re-seed, delete existing data first.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('🌱 Seeding database with sample data...\n');

    // Create sample users
    console.log('👤 Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const user1Id = await userModel.createUser({
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: passwordHash
    });
    console.log('   ✅ Created user: alice@example.com');

    const user2Id = await userModel.createUser({
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: passwordHash
    });
    console.log('   ✅ Created user: bob@example.com');

    const user3Id = await userModel.createUser({
      username: 'charlie',
      email: 'charlie@example.com',
      passwordHash: passwordHash
    });
    console.log('   ✅ Created user: charlie@example.com\n');

    // Create sample books
    console.log('📚 Creating books...');
    const book1Id = await bookModel.create({
      title: 'The Great Gatsby',
      authors: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      coverUrl: null
    });
    console.log('   ✅ Created book: The Great Gatsby');

    const book2Id = await bookModel.create({
      title: 'To Kill a Mockingbird',
      authors: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      coverUrl: null
    });
    console.log('   ✅ Created book: To Kill a Mockingbird');

    const book3Id = await bookModel.create({
      title: '1984',
      authors: 'George Orwell',
      isbn: '978-0-452-28423-4',
      coverUrl: null
    });
    console.log('   ✅ Created book: 1984');

    const book4Id = await bookModel.create({
      title: 'Pride and Prejudice',
      authors: 'Jane Austen',
      isbn: '978-0-14-143951-8',
      coverUrl: null
    });
    console.log('   ✅ Created book: Pride and Prejudice');

    const book5Id = await bookModel.create({
      title: 'The Catcher in the Rye',
      authors: 'J.D. Salinger',
      isbn: '978-0-316-76948-0',
      coverUrl: null
    });
    console.log('   ✅ Created book: The Catcher in the Rye\n');

    // Create sample reviews
    console.log('⭐ Creating reviews...');
    await reviewModel.create({
      user_id: user1Id,
      book_id: book1Id,
      username: 'alice',
      rating: 5,
      content: 'An absolute masterpiece! Fitzgerald\'s writing is beautiful and the story is timeless. Highly recommend!'
    });
    console.log('   ✅ Created review for The Great Gatsby');

    await reviewModel.create({
      user_id: user2Id,
      book_id: book1Id,
      username: 'bob',
      rating: 4,
      content: 'Great classic novel. The symbolism is rich and the characters are well-developed.'
    });
    console.log('   ✅ Created review for The Great Gatsby');

    await reviewModel.create({
      user_id: user1Id,
      book_id: book2Id,
      username: 'alice',
      rating: 5,
      content: 'One of the best books I\'ve ever read. Harper Lee\'s storytelling is powerful and moving.'
    });
    console.log('   ✅ Created review for To Kill a Mockingbird');

    await reviewModel.create({
      user_id: user3Id,
      book_id: book3Id,
      username: 'charlie',
      rating: 5,
      content: 'A chilling dystopian novel that feels more relevant than ever. Orwell was ahead of his time.'
    });
    console.log('   ✅ Created review for 1984');

    await reviewModel.create({
      user_id: user2Id,
      book_id: book4Id,
      username: 'bob',
      rating: 4,
      content: 'A delightful classic romance. Jane Austen\'s wit and social commentary are excellent.'
    });
    console.log('   ✅ Created review for Pride and Prejudice\n');

    // Show summary
    const finalUserCount = await userModel.countAll();
    const finalBookCount = await bookModel.countAll();
    const finalReviewCount = await reviewModel.countAll();

    console.log('📊 Seed Complete!\n');
    console.log('📈 Summary:');
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Books: ${finalBookCount}`);
    console.log(`   Reviews: ${finalReviewCount}\n`);
    console.log('💡 Test Accounts:');
    console.log('   Email: alice@example.com, Password: password123');
    console.log('   Email: bob@example.com, Password: password123');
    console.log('   Email: charlie@example.com, Password: password123\n');
    console.log('✅ Database is now ready! You can see it in MongoDB Compass.\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

seed();













