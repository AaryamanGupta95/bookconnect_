const bookModel = require('../models-mongo/bookModel');
const userModel = require('../models-mongo/userModel');
const reviewModel = require('../models-mongo/reviewModel');
const mongoose = require('mongoose');

exports.renderAnalytics = async (req, res, next) => {
  try {
    const [booksStats, totalUsers, totalReviews, users] = await Promise.all([
      bookModel.getBookStats(),
      userModel.countAll(),
      reviewModel.countAll(),
      userModel.getAll()
    ]);

    const totalBooks = booksStats.length;
    const totalViews = booksStats.reduce((sum, book) => sum + (book.views || 0), 0);

    // Get active sessions from MongoDB
    let activeSessions = [];
    try {
      const Session = mongoose.model('Session');
      const sessions = await Session.find({ expires: { $gt: new Date() } }).sort({ expires: 1 });
      activeSessions = sessions.map(session => {
        try {
          const sessionData = JSON.parse(session.session);
          return {
            id: session._id,
            username: sessionData.user?.username || 'Unknown',
            email: sessionData.user?.email || 'Unknown',
            isAdmin: sessionData.user?.isAdmin || false,
            expires: session.expires,
            created: session.createdAt || session.expires
          };
        } catch (e) {
          return {
            id: session._id,
            username: 'Unknown',
            email: 'Unknown',
            isAdmin: false,
            expires: session.expires,
            created: session.expires
          };
        }
      });
    } catch (sessionErr) {
      console.error('Error fetching sessions:', sessionErr);
    }

    res.render('adminAnalytics', {
      totals: {
        books: totalBooks,
        users: totalUsers,
        reviews: totalReviews,
        views: totalViews,
        sessions: activeSessions.length
      },
      booksStats,
      users,
      activeSessions
    });
  } catch (err) {
    next(err);
  }
};

