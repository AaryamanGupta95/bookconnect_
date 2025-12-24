const mongoose = require('mongoose');
const { Schema } = mongoose;

// Book Schema (equivalent to MySQL books table)
const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  authors: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  isbn: {
    type: String,
    trim: true,
    maxlength: 20,
    default: null
  },
  cover_url: {
    type: String,
    trim: true,
    maxlength: 255,
    default: null
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'books'
});

// Create indexes
bookSchema.index({ isbn: 1 });
bookSchema.index({ title: 1 });
bookSchema.index({ views: -1 });

const Book = mongoose.model('Book', bookSchema);

class BookModel {
  async create(bookData) {
    const { title, authors, isbn, coverUrl = null } = bookData;
    const book = new Book({
      title,
      authors: authors || '',
      isbn: isbn || null,
      cover_url: coverUrl,
      views: 0
    });
    await book.save();
    return book._id.toString();
  }

  async update(id, bookData) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
    const updateData = {};
    if (bookData.title) updateData.title = bookData.title;
    if (typeof bookData.authors !== 'undefined') updateData.authors = bookData.authors;
    if (typeof bookData.isbn !== 'undefined') updateData.isbn = bookData.isbn;
    if (typeof bookData.coverUrl !== 'undefined') updateData.cover_url = bookData.coverUrl;
    
    if (Object.keys(updateData).length === 0) return false;
    
    try {
      const result = await Book.findByIdAndUpdate(id, updateData, { new: true });
      return result !== null;
    } catch (error) {
      console.error('Error updating book:', error);
      return false;
    }
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
    const book = await Book.findOne({ isbn });
    if (!book) return null;
    return this._formatBook(book);
  }

  async findByTitle(title) {
    if (!title) return null;
    const book = await Book.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    if (!book) return null;
    return this._formatBook(book);
  }
  
  async findById(id) {
    if (!id) return null;
    let book = null;
    
    // Try ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      book = await Book.findById(id);
    }
    
    // If not found, try as string ID (for backward compatibility)
    if (!book) {
      book = await Book.findOne({ _id: id });
    }
    
    if (!book) return null;
    return this._formatBook(book);
  }
  
  async getAll() {
    const books = await Book.find().sort({ title: 1 });
    return books.map(book => this._formatBook(book));
  }

  async delete(id) {
    if (!id) return false;
    try {
      let result = null;
      // Try ObjectId first
      if (mongoose.Types.ObjectId.isValid(id)) {
        result = await Book.findByIdAndDelete(id);
      } else {
        // Try as string ID
        result = await Book.findOneAndDelete({ _id: id });
      }
      return result !== null;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  async countAll() {
    return await Book.countDocuments();
  }

  async incrementViews(id) {
    if (!id) return;
    try {
      // Try ObjectId first
      if (mongoose.Types.ObjectId.isValid(id)) {
        await Book.findByIdAndUpdate(id, { $inc: { views: 1 } });
      } else {
        // Try as string ID
        await Book.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  async getBookStats() {
    const Review = mongoose.model('Review');
    const books = await Book.find().sort({ title: 1 });
    const stats = await Promise.all(books.map(async (book) => {
      const reviewCount = await Review.countDocuments({ book_id: book._id.toString() });
      return {
        id: book._id.toString(),
        title: book.title,
        views: book.views || 0,
        cover_url: book.cover_url,
        review_count: reviewCount
      };
    }));
    return stats;
  }

  // Helper to format book document to match MySQL result format
  _formatBook(book) {
    return {
      id: book._id.toString(),
      title: book.title,
      authors: book.authors || '',
      isbn: book.isbn || null,
      cover_url: book.cover_url || null,
      views: book.views || 0,
      created_at: book.createdAt,
      updated_at: book.updatedAt
    };
  }
}

module.exports = new BookModel();

