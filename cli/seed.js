const pool = require('../db');

async function seed() {
  try {
    // create some users/books/reviews
    await pool.query('INSERT INTO users (username,email,password_hash) VALUES (?, ?, ?)', ['alice','alice@ex.com','*placeholder*']);
    // ... more inserts
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
