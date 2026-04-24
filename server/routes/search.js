const express = require('express')
const { scrapeGoogleMaps } = require('../scrapers/googleMapsScraper')

const router = express.Router()

const searchJobs = new Map()

function makeJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function sanitizeBusinesses(businesses = []) {
  return Array.isArray(businesses) ? businesses : []
}

// START SEARCH
router.post('/start', async (req, res) => {
  const query = String(req.body?.query || '').trim()
  const limit = Number(req.body?.limit || 25)

  if (!query || query.length < 3) {
    return res.status(400).json({ success: false, error: 'Invalid query' })
  }

  const jobId = makeJobId()

  searchJobs.set(jobId, {
    id: jobId,
    query,
    status: 'running',
    stopRequested: false,
    startedAt: Date.now(),
    fetchedCount: 0,
    totalDiscovered: 0,
    businesses: [],
    error: '',
    done: false,
    stopped: false,
  })

  res.json({
    success: true,
    jobId,
  })

  ;(async () => {
    const job = searchJobs.get(jobId)
    if (!job) return

    try {
      const businesses = await scrapeGoogleMaps(query, {
        limit,
        shouldStop: () => {
          const liveJob = searchJobs.get(jobId)
          return !!liveJob?.stopRequested
        },
        onProgress: ({ fetchedCount, totalDiscovered, latestBusiness, businesses: allBusinesses }) => {
          const liveJob = searchJobs.get(jobId)
          if (!liveJob) return

          liveJob.fetchedCount = fetchedCount
          liveJob.totalDiscovered = totalDiscovered
          liveJob.latestBusiness = latestBusiness || null
          liveJob.businesses = sanitizeBusinesses(allBusinesses)
          searchJobs.set(jobId, liveJob)
        },
      })

      const liveJob = searchJobs.get(jobId)
      if (!liveJob) return

      liveJob.businesses = sanitizeBusinesses(businesses)
      liveJob.fetchedCount = liveJob.businesses.length
      liveJob.done = true
      liveJob.stopped = !!liveJob.stopRequested
      liveJob.status = liveJob.stopRequested ? 'stopped' : 'completed'

      searchJobs.set(jobId, liveJob)
    } catch (err) {
      const liveJob = searchJobs.get(jobId)
      if (!liveJob) return

      liveJob.error = err.message || 'Search failed'
      liveJob.done = true
      liveJob.status = 'failed'
      searchJobs.set(jobId, liveJob)
    }
  })()
})

// GET PROGRESS
router.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params
  const job = searchJobs.get(jobId)

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Search job not found',
    })
  }

  return res.json({
    success: true,
    jobId: job.id,
    query: job.query,
    status: job.status,
    done: job.done,
    stopped: job.stopped,
    fetchedCount: job.fetchedCount,
    totalDiscovered: job.totalDiscovered,
    businesses: job.businesses,
    error: job.error || '',
  })
})

// STOP SEARCH
router.post('/stop/:jobId', (req, res) => {
  const { jobId } = req.params
  const job = searchJobs.get(jobId)

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Search job not found',
    })
  }

  job.stopRequested = true
  job.status = 'stopping'
  searchJobs.set(jobId, job)

  return res.json({
    success: true,
    message: 'Stop requested',
    jobId,
  })
})

// OPTIONAL: old endpoint compatibility
router.post('/', async (req, res) => {
  const query = String(req.body?.query || '').trim()

  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Invalid query' })
  }

  try {
    const businesses = await scrapeGoogleMaps(query, { limit: 25 })

    res.json({
      success: true,
      count: businesses.length,
      businesses,
      source: 'google_maps_only',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Search failed' })
  }
})

module.exports = router