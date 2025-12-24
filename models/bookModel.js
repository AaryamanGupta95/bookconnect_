const db = require('../db');

class BookModel {
  async create(bookData) {
    const { title, authors, isbn, coverUrl = null } = bookData;
    const query = 'INSERT INTO books (title, authors, isbn, cover_url, views) VALUES (?, ?, ?, ?, 0)';
    const [result] = await db.execute(query, [title, authors, isbn, coverUrl]);
    return result.insertId;
  }

  async update(id, bookData) {
    const fields = [];
    const values = [];
    if (bookData.title) { fields.push('title = ?'); values.push(bookData.title); }
    if (typeof bookData.authors !== 'undefined') { fields.push('authors = ?'); values.push(bookData.authors); }
    if (typeof bookData.isbn !== 'undefined') { fields.push('isbn = ?'); values.push(bookData.isbn); }
    if (typeof bookData.coverUrl !== 'undefined') { fields.push('cover_url = ?'); values.push(bookData.coverUrl); }
    if (!fields.length) return false;
    const query = `UPDATE books SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  async findOrCreate(bookData) {
    const { title, isbn } = bookData;
    let existingBook = null;
    if (isbn) {
      existingBook = await this.findByISBN(isbn);
    }
    if (!existingBook && title) {
      existingBook = await this.findByTitle(title);
    }
    if (existingBook) {
      return existingBook.id;
    }
    return this.create(bookData);
  }
  
  async findByISBN(isbn) {
    if (!isbn) return null;
    const query = 'SELECT * FROM books WHERE isbn = ?';
    const [rows] = await db.execute(query, [isbn]);
    return rows[0] || null;
  }

  async findByTitle(title) {
    if (!title) return null;
    const query = 'SELECT * FROM books WHERE title = ? LIMIT 1';
    const [rows] = await db.execute(query, [title]);
    return rows[0] || null;
  }
  
  async findById(id) {
    const query = 'SELECT * FROM books WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }
  
  async getAll() {
    const query = 'SELECT * FROM books ORDER BY title';
    const [rows] = await db.execute(query);
    return rows;
  }

  async delete(id) {
    const query = 'DELETE FROM books WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM books');
    return rows[0].count || 0;
  }

  async incrementViews(id) {
    await db.execute('UPDATE books SET views = views + 1 WHERE id = ?', [id]);
  }

  async getBookStats() {
    const query = `
      SELECT 
        b.id,
        b.title,
        b.views,
        b.cover_url,
        COUNT(r.id) AS review_count
      FROM books b
      LEFT JOIN reviews r ON r.book_id = b.id
      GROUP BY b.id
      ORDER BY b.title
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
}

module.exports = new BookModel();
