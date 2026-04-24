const express = require('express');
const { scrapeGoogleMaps } = require('../scrapers/googleMapsScraper');

const router = express.Router();

// POST /api/search
router.post('/', async (req, res) => {
  const { query } = req.body || {};

  if (!query || String(query).trim().length < 3) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    const businesses = await scrapeGoogleMaps(String(query).trim());
    return res.json({ success: true, count: businesses.length, businesses });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Scrape error:', err);
    return res.status(500).json({ error: 'Scraping failed. Try again.' });
  }
});

module.exports = router;

