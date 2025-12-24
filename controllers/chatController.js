/**
 * Chat Controller
 * Handles chat page rendering
 */

exports.showChat = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('chat', {
    currentUser: req.session.user
  });
};













