const express = require('express');
const router = express.Router();
const { scrapeBusinessEmails } = require('../scrapers/emailScraper');

router.post('/', async (req, res) => {
  try {
    const { website } = req.body;

    if (!website) {
      return res.json({
        success: false,
        message: 'Website required'
      });
    }

    const result = await scrapeBusinessEmails(website);

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: 'Error scraping emails'
    });
  }
});

module.exports = router;