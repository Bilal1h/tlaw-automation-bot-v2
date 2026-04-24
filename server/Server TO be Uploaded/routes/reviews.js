const express = require('express');
const { scrapeReviews } = require('../scrapers/reviewScraper');

const router = express.Router();

// POST /api/reviews
router.post('/', async (req, res) => {
  const { businessName, googleMapsUrl } = req.body || {};

  if (!googleMapsUrl) {
    return res.status(400).json({ error: 'Missing googleMapsUrl' });
  }

  try {
    const reviews = await scrapeReviews(businessName || '', googleMapsUrl);
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Review scrape error:', err);
    return res.status(500).json({ error: 'Review scraping failed. Try again.' });
  }
});

module.exports = router;

