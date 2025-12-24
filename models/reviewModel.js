const db = require('../db');

class ReviewModel {
  async create(reviewData) {
    const { user_id, book_id, rating, content } = reviewData;
    
    const query = 'INSERT INTO reviews (user_id, book_id, rating, content, created_at) VALUES (?, ?, ?, ?, NOW())';
    const [result] = await db.execute(query, [user_id, book_id, rating, content]);
    return result.insertId;
  }
  
  async getAllWithUserAndBook() {
    const query = `
      SELECT 
        r.*,
        u.username,
        u.email,
        b.title as book_title,
        b.authors as book_authors,
        b.isbn as book_isbn
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
  
  async getByUserId(userId) {
    const query = `
      SELECT 
        r.*,
        b.title as book_title,
        b.authors as book_authors,
        b.isbn as book_isbn,
        b.cover_url as book_cover
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
  
  async getByBookId(bookId) {
    const query = `
      SELECT 
        r.*,
        u.username,
        u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [bookId]);
    return rows;
  }
  
  async findById(id) {
    const query = 'SELECT * FROM reviews WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }
  
  async update(id, reviewData) {
    const { rating, content } = reviewData;
    const query = 'UPDATE reviews SET rating = ?, content = ?, updated_at = NOW() WHERE id = ?';
    const [result] = await db.execute(query, [rating, content, id]);
    return result.affectedRows > 0;
  }
  
  async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM reviews');
    return rows[0].count || 0;
  }

  async isFirstReview() {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM reviews');
    return (rows[0].count || 0) === 0;
  }
}

module.exports = new ReviewModel();
