const mongoose = require('mongoose');
const { Schema } = mongoose;

// Review Schema (equivalent to MySQL reviews table)
const reviewSchema = new Schema({
  user_id: {
    type: String, // Storing as string to match MySQL behavior
    required: true,
    ref: 'User'
  },
  username: {
    type: String, // Store username for quick access
    required: true,
    trim: true
  },
  book_id: {
    type: String, // Storing as string to match MySQL behavior
    required: true,
    ref: 'Book'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'reviews'
});

// Create indexes
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ book_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

class ReviewModel {
  async create(reviewData) {
    const { user_id, book_id, rating, content, username } = reviewData;
    
    // If username not provided, fetch it from User model
    let reviewUsername = username;
    if (!reviewUsername && user_id) {
      const User = mongoose.model('User');
      const user = await User.findById(user_id);
      reviewUsername = user ? user.username : 'Unknown';
    }
    
    const review = new Review({
      user_id: user_id.toString(),
      username: reviewUsername,
      book_id: book_id.toString(),
      rating,
      content: content.trim()
    });
    await review.save();
    return review._id.toString();
  }
  
  async getAllWithUserAndBook() {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const User = mongoose.model('User');
    const Book = mongoose.model('Book');
    
    const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
      // Try to get user by ObjectId first, then by string ID
      let user = null;
      if (mongoose.Types.ObjectId.isValid(review.user_id)) {
        user = await User.findById(review.user_id);
      }
      if (!user) {
        user = await User.findOne({ _id: review.user_id }) || await User.findOne({ email: review.user_id });
      }
      
      // Try to get book by ObjectId first, then by string ID
      let book = null;
      if (mongoose.Types.ObjectId.isValid(review.book_id)) {
        book = await Book.findById(review.book_id);
      }
      if (!book) {
        book = await Book.findOne({ _id: review.book_id });
      }
      
      return {
        id: review._id.toString(),
        user_id: review.user_id,
        book_id: review.book_id,
        rating: review.rating,
        content: review.content,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        username: review.username || (user ? user.username : 'Unknown'),
        email: user ? user.email : '',
        book_title: book ? book.title : 'Unknown Book',
        book_authors: book ? book.authors : '',
        book_isbn: book ? book.isbn : null
      };
    }));
    
    return reviewsWithDetails;
  }
  
  async getByUserId(userId) {
    const reviews = await Review.find({ user_id: userId.toString() }).sort({ createdAt: -1 });
    const Book = mongoose.model('Book');
    
    const reviewsWithBook = await Promise.all(reviews.map(async (review) => {
      // Try to get book by ObjectId first, then by string ID
      let book = null;
      if (mongoose.Types.ObjectId.isValid(review.book_id)) {
        book = await Book.findById(review.book_id);
      }
      if (!book) {
        book = await Book.findOne({ _id: review.book_id });
      }
      
      return {
        id: review._id.toString(),
        user_id: review.user_id,
        book_id: review.book_id,
        rating: review.rating,
        content: review.content,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        username: review.username || 'Unknown',
        book_title: book ? book.title : 'Unknown Book',
        book_authors: book ? book.authors : '',
        book_isbn: book ? book.isbn : null,
        book_cover: book ? book.cover_url : null
      };
    }));
    
    return reviewsWithBook;
  }
  
  async getByBookId(bookId) {
    const reviews = await Review.find({ book_id: bookId.toString() }).sort({ createdAt: -1 });
    const User = mongoose.model('User');
    
    const reviewsWithUser = await Promise.all(reviews.map(async (review) => {
      // Try to get user by ObjectId first, then by string ID
      let user = null;
      if (mongoose.Types.ObjectId.isValid(review.user_id)) {
        user = await User.findById(review.user_id);
      }
      if (!user) {
        user = await User.findOne({ _id: review.user_id }) || await User.findOne({ email: review.user_id });
      }
      
      return {
        id: review._id.toString(),
        user_id: review.user_id,
        book_id: review.book_id,
        rating: review.rating,
        content: review.content,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        username: review.username || (user ? user.username : 'Unknown'),
        email: user ? user.email : ''
      };
    }));
    
    return reviewsWithUser;
  }
  
  async findById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    const review = await Review.findById(id);
    if (!review) return null;
    
    return {
      id: review._id.toString(),
      user_id: review.user_id,
      book_id: review.book_id,
      rating: review.rating,
      content: review.content,
      created_at: review.createdAt,
      updated_at: review.updatedAt
    };
  }
  
  async update(id, reviewData) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
    const { rating, content } = reviewData;
    try {
      const result = await Review.findByIdAndUpdate(
        id,
        { rating, content: content.trim() },
        { new: true }
      );
      return result !== null;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  }
  
  async delete(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return false;
    try {
      const result = await Review.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  async countAll() {
    return await Review.countDocuments();
  }

  async countByUserId(userId) {
    return await Review.countDocuments({ user_id: userId.toString() });
  }

  async isFirstReview() {
    const count = await Review.countDocuments();
    return count === 0;
  }

  async deleteByBookId(bookId) {
    try {
      const result = await Review.deleteMany({ book_id: bookId.toString() });
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error deleting reviews by book ID:', error);
      throw error;
    }
  }
}

module.exports = new ReviewModel();

