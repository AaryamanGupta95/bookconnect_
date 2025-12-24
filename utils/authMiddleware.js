// Simple auth middleware
module.exports.requireAuth = function (req, res, next) {
  if (req.session && req.session.user) return next();
  // For API requests return 401
  if (req.path.startsWith('/api') || req.xhr) return res.status(401).json({ error: 'Unauthorized' });
  res.redirect('/login');
};

module.exports.requireAdmin = function (req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) return next();
  if (req.path.startsWith('/api') || req.xhr) return res.status(403).json({ error: 'Forbidden' });
  res.status(403).render('error', { error: { message: 'Forbidden' } });
};
