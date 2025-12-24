const bookModel = require('../models-mongo/bookModel');

/**
 * Get author profile and books by author
 */
exports.getAuthorProfile = async (req, res, next) => {
  try {
    const authorName = req.params.authorName || req.query.author;
    
    if (!authorName) {
      return res.status(400).render('error', { error: { message: 'Author name is required' } });
    }

    // Get all books by this author
    const allBooks = await bookModel.getAll();
    const authorBooks = allBooks.filter(book => {
      if (!book.authors) return false;
      // Check if author name appears in the authors field (case-insensitive)
      const bookAuthors = book.authors.toLowerCase().split(',').map(a => a.trim());
      const searchAuthor = authorName.toLowerCase().trim();
      return bookAuthors.some(a => a.includes(searchAuthor) || searchAuthor.includes(a));
    });

    // Extract unique author names from matching books
    const authorNames = new Set();
    authorBooks.forEach(book => {
      if (book.authors) {
        book.authors.split(',').forEach(author => {
          const trimmed = author.trim();
          if (trimmed.toLowerCase().includes(authorName.toLowerCase()) || 
              authorName.toLowerCase().includes(trimmed.toLowerCase())) {
            authorNames.add(trimmed);
          }
        });
      }
    });

    // Use the most matching author name or the first one found
    const primaryAuthorName = Array.from(authorNames).find(name => 
      name.toLowerCase().includes(authorName.toLowerCase())
    ) || Array.from(authorNames)[0] || authorName;

    // Calculate author stats
    const totalBooks = authorBooks.length;
    const totalViews = authorBooks.reduce((sum, book) => sum + (book.views || 0), 0);
    const avgViews = totalBooks > 0 ? Math.round(totalViews / totalBooks) : 0;

    res.render('authorProfile', {
      authorName: primaryAuthorName,
      books: authorBooks,
      stats: {
        totalBooks,
        totalViews,
        avgViews
      },
      searchQuery: authorName
    });
  } catch (err) {
    next(err);
  }
};













