/**
 * Create Admin User
 * 
 * This script creates an admin user in the MongoDB database.
 * 
 * Usage: node cli/create-admin.js [email] [password] [username]
 * 
 * Example: node cli/create-admin.js admin@bookconnect.com admin123 admin
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userModel = require('../models-mongo/userModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_connect';

async function createAdmin() {
  try {
    // Get command line arguments or use defaults
    const email = process.argv[2] || 'admin@bookconnect.com';
    const password = process.argv[3] || 'admin123';
    const username = process.argv[4] || 'admin';

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if user already exists
    const existing = await userModel.findByEmail(email);
    if (existing) {
      console.log(`⚠️  User with email ${email} already exists!`);
      console.log(`   Username: ${existing.username}`);
      console.log(`   ID: ${existing.id}\n`);
      
      // Ask if they want to update password
      console.log('💡 To update password, delete the user first or use a different email.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('👤 Creating admin user...\n');
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}\n`);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await userModel.createUser({
      username,
      email,
      passwordHash
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log('💡 Note: This user will have admin privileges because:');
    console.log('   1. The email matches HOST_EMAIL in .env, OR');
    console.log('   2. The email matches ADMIN_EMAIL in .env, OR');
    console.log('   3. You can set ADMIN_EMAIL in .env to grant admin access\n');
    console.log('🔧 To grant admin access, add this to your .env file:');
    console.log(`   ADMIN_EMAIL=${email}\n`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

createAdmin();













