const pool = require('../db');

async function createUser({ username, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function countAll() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  return rows[0].count || 0;
}

module.exports = { createUser, findByEmail, countAll };
