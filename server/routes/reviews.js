const express = require('express')
const router = express.Router()
const { scrapeReviews } = require('../scrapers/reviewScraper')

// POST /api/reviews
router.post('/', async (req, res) => {
  const {
    name,
    googleMapsUrl,
    rating,
    reviewCount,
  } = req.body || {}

  console.log('\x1b[36m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\x1b[35m%s\x1b[0m', '[REVIEWS ROUTE] Incoming request')
  console.log('\x1b[33m%s\x1b[0m', `Name: ${name || 'N/A'}`)
  console.log('\x1b[33m%s\x1b[0m', `Google Maps URL: ${googleMapsUrl || 'N/A'}`)
  console.log('\x1b[33m%s\x1b[0m', `Rating: ${rating ?? 'N/A'} | Review Count: ${reviewCount ?? 'N/A'}`)

  if (!googleMapsUrl) {
    console.log('\x1b[31m%s\x1b[0m', '[REVIEWS ROUTE] Missing Google Maps URL')
    return res.status(400).json({
      success: false,
      error: 'Missing Google Maps URL',
      reviews: [],
      count: 0,
    })
  }

  try {
    const result = await scrapeReviews(
      name,
      googleMapsUrl,
      {
        rating,
        reviewCount,
      }
    )

    console.log('\x1b[32m%s\x1b[0m', `[REVIEWS ROUTE] Scraper finished | success=${result.success} | source=${result.source || 'N/A'} | reviews=${result.reviews?.length || 0}`)

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: result.reason || 'Failed to fetch reviews',
        reviews: result.reviews || [],
        count: result.reviews?.length || 0,
        source: result.source || 'none',
        fallback: !!result.fallback,
        inferredPainPoints: result.inferredPainPoints || [],
      })
    }

    return res.json({
      success: true,
      count: result.reviews.length,
      reviews: result.reviews,
      source: result.source || 'primary',
      fallback: !!result.fallback,
      inferredPainPoints: result.inferredPainPoints || [],
    })
  } catch (err) {
    console.log('\x1b[31m%s\x1b[0m', `[REVIEWS ROUTE] Error: ${err.message}`)

    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch reviews',
      reviews: [],
      count: 0,
    })
  }
})

module.exports = router