const express = require('express');
const router = express.Router();

router.get('/404-showcase', (req, res) => {
  res.status(404).render('404', {
    message: 'This is a curated example of our error handling for broken pages.'
  });
});

module.exports = router;

