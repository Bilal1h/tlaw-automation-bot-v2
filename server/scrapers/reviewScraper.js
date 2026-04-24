const puppeteer = require('puppeteer')

// ==========================================================
// CONFIG
// ==========================================================
const DEFAULT_VIEWPORT = { width: 1440, height: 960 }
const MAX_SCROLL_ROUNDS = 18
const MIN_REVIEW_TEXT_LENGTH = 4

// ==========================================================
// TERMINAL LOGGER (beautiful without extra package)
// ==========================================================
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

function nowTime() {
  return new Date().toLocaleTimeString()
}

function logLine(label, color, msg) {
  console.log(
    `${color}${C.bold}[${label}]${C.reset} ${C.gray}${nowTime()}${C.reset} ${msg}`
  )
}

const logger = {
  info: (msg) => logLine('INFO', C.cyan, msg),
  step: (msg) => logLine('STEP', C.blue, msg),
  ok: (msg) => logLine(' OK ', C.green, msg),
  warn: (msg) => logLine('WARN', C.yellow, msg),
  err: (msg) => logLine('ERR ', C.red, msg),
  debug: (msg) => logLine('DBG ', C.magenta, msg),
  divider: (title = '') => {
    const line = '─'.repeat(72)
    if (title) {
      console.log(`\n${C.bold}${C.white}${line}${C.reset}`)
      console.log(`${C.bold}${C.white}${title}${C.reset}`)
      console.log(`${C.bold}${C.white}${line}${C.reset}`)
    } else {
      console.log(`\n${C.bold}${C.white}${line}${C.reset}`)
    }
  },
}

// ==========================================================
// HELPERS
// ==========================================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function cleanText(v) {
  return String(v || '').replace(/\s+/g, ' ').trim()
}

function normalizeKey(v) {
  return cleanText(v).toLowerCase()
}

function dedupeReviews(reviews = []) {
  const seenReviewIds = new Set()
  const seenTextKeys = new Set()
  const out = []

  for (const review of reviews) {
    const textKey = normalizeKey(review.text)
    const reviewId = String(review.reviewId || '').trim()

    if (!review.text || review.text.length < MIN_REVIEW_TEXT_LENGTH) continue

    // strongest dedupe
    if (reviewId) {
      if (seenReviewIds.has(reviewId)) continue
      seenReviewIds.add(reviewId)
    }

    // secondary dedupe by text
    if (textKey) {
      if (seenTextKeys.has(textKey)) continue
      seenTextKeys.add(textKey)
    }

    // reject anonymous duplicate if no author and long text already exists
    if (!review.author && textKey) continue

    out.push(review)
  }

  return out
}
function parseRatingFromLabel(label = '') {
  const match = String(label).match(/(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : null
}

function sanitizeReviewText(text = '') {
  const t = cleanText(text)

  if (!t) return ''

  const junkOnly = [
    'more',
    'see more',
    'like',
    'share',
    'report',
    'flag',
    'owner response',
    'owner',
    'local guide',
    'google review',
  ]

  if (junkOnly.includes(t.toLowerCase())) return ''
  if (/^\d+(\.\d+)?\s*stars?$/i.test(t)) return ''
  if (/^\d+\s*reviews?$/i.test(t)) return ''
  if (/^\d+\s*photos?$/i.test(t)) return ''

  return t
}

function inferPainPointsFromBusinessMeta(businessMeta = {}) {
  const rating = Number(businessMeta.rating || 0)
  const reviewCount = Number(businessMeta.reviewCount || 0)

  const categories = []

  if (rating > 0 && rating < 3.5 && reviewCount >= 10) {
    categories.push('poor_communication', 'slow_service', 'trust_issues')
  } else if (rating >= 3.5 && rating < 4.2 && reviewCount >= 20) {
    categories.push('mixed_reputation', 'service_inconsistency')
  } else if (rating >= 4.2 && reviewCount >= 50) {
    categories.push('good_reputation')
  }

  return categories
}

// ==========================================================
// PAGE STEALTH / SETUP
// ==========================================================
async function preparePage(page) {
  await page.setViewport(DEFAULT_VIEWPORT)

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  )

  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
  })

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' })
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
  })
}

// ==========================================================
// NAVIGATION
// ==========================================================
async function gotoPlace(page, googleMapsUrl, name) {
  logger.step(`Opening Google Maps page for ${C.bold}${name}${C.reset}`)
  await page.goto(googleMapsUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })

  await sleep(3000)

  const title = await page.title().catch(() => '')
  logger.debug(`Page title: ${title || 'N/A'}`)
}

async function clickReviewsTab(page) {
  logger.step('Trying to open Reviews tab')

  try {
    await page.waitForFunction(
      () => document.body && document.body.innerText.length > 0,
      { timeout: 15000 }
    )
  } catch (_) {}

  const clicked = await page.evaluate(() => {
    const clean = (v) => String(v || '').trim().toLowerCase()

    const candidates = Array.from(
      document.querySelectorAll('[role="tab"], button, div[role="button"], a, span')
    )

    const scoreEl = (el) => {
      const text = clean(el.textContent)
      const aria = clean(el.getAttribute('aria-label'))
      const title = clean(el.getAttribute('title'))

      let score = 0

      if (text === 'reviews') score += 10
      if (text.includes('reviews')) score += 8
      if (aria.includes('reviews')) score += 8
      if (aria.includes('review')) score += 6
      if (title.includes('reviews')) score += 4

      // catch things like "23 reviews"
      if (/\d+\s+reviews?/.test(text)) score += 7
      if (/\d+\s+reviews?/.test(aria)) score += 7

      return score
    }

    const scored = candidates
      .map((el) => ({ el, score: scoreEl(el) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)

    const target = scored[0]?.el
    if (!target) return false

    try {
      target.scrollIntoView({ behavior: 'instant', block: 'center' })
    } catch (_) {}

    try {
      target.click()
    } catch (_) {}

    for (const type of ['mouseover', 'mousedown', 'mouseup', 'click']) {
      try {
        target.dispatchEvent(
          new MouseEvent(type, {
            view: window,
            bubbles: true,
            cancelable: true,
          })
        )
      } catch (_) {}
    }

    return true
  })

  if (!clicked) {
    logger.warn('Could not confidently locate Reviews tab')
    return false
  }

  await sleep(3000)

  const opened = await page.evaluate(() => {
    return !!(
      document.querySelector('[data-review-id]') ||
      document.querySelector('div.jftiEf') ||
      document.querySelector('.wiI7pd') ||
      document.querySelector('[aria-label*=" reviews"]') ||
      document.querySelector('[role="feed"]')
    )
  })

  if (opened) {
    logger.ok('Reviews panel appears to be open')
    return true
  }

  logger.warn('A click was dispatched, but review panel did not actually open')
  return false
}
async function waitForReviewContainers(page) {
  logger.step('Waiting for review containers to appear')

  try {
    await page.waitForFunction(
      () => {
        return (
          document.querySelector('[data-review-id]') ||
          document.querySelector('div.jftiEf') ||
          document.querySelector('div.MyEned') ||
          document.querySelector('.wiI7pd')
        )
      },
      { timeout: 15000 }
    )

    logger.ok('Review-related DOM found')
    return true
  } catch (_) {
    logger.warn('Review containers did not appear in time')
    return false
  }
}

// ==========================================================
// REVIEW PANEL INTERACTIONS
// ==========================================================
async function expandMoreButtons(page) {
  const clickedCount = await page.evaluate(() => {
    let count = 0

    const clickable = Array.from(
      document.querySelectorAll('button, div[role="button"], span, div')
    )

    for (const el of clickable) {
      const text = String(el.textContent || '').trim().toLowerCase()
      const aria = String(el.getAttribute('aria-label') || '').trim().toLowerCase()
      const expanded = el.getAttribute('aria-expanded')

      const looksLikeMore =
        text === 'more' ||
        text === 'see more' ||
        aria.includes('see more') ||
        aria === 'more'

      if (!looksLikeMore) continue
      if (expanded === 'true') continue

      try {
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
        el.click()
        count++
      } catch (_) {}
    }

    return count
  })

  if (clickedCount > 0) {
    logger.debug(`Expanded ${clickedCount} "more" buttons`)
    await sleep(800)
  }

  return clickedCount
}

async function scrollReviewsPanel(page, rounds = MAX_SCROLL_ROUNDS) {
  logger.step(`Scrolling reviews panel (${rounds} rounds max)`)

  let lastCardCount = 0
  let stableRounds = 0

  for (let i = 0; i < rounds; i++) {
    const result = await page.evaluate(() => {
      const selectors = [
        'div[role="feed"]',
        'div.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde',
        'div.m6QErb.DxyBCb.kA9KIf.dS8AEf',
        'div.m6QErb.DxyBCb',
        'div[aria-label*="review"]',
      ]

      let panel = null
      for (const sel of selectors) {
        panel = document.querySelector(sel)
        if (panel) break
      }

      const cards = document.querySelectorAll('[data-review-id], div.jftiEf, div.MyEned').length

      if (panel) {
        panel.scrollTop = panel.scrollHeight
      } else {
        window.scrollBy(0, 1800)
      }

      return {
        cards,
        panelFound: !!panel,
      }
    })

    await sleep(1200)
    await expandMoreButtons(page)

    logger.debug(
      `Scroll round ${i + 1}: cards=${result.cards}, panel=${result.panelFound ? 'yes' : 'no'}`
    )

    if (result.cards === lastCardCount) {
      stableRounds++
    } else {
      stableRounds = 0
      lastCardCount = result.cards
    }

    if (stableRounds >= 3 && result.cards > 0) {
      logger.ok('Review count stabilized; stopping scroll early')
      break
    }
  }
}

// ==========================================================
// EXTRACTION STRATEGY 1 — direct selectors inside review cards
// ==========================================================
async function extractReviewsPrimary(page) {
  logger.step('Primary extraction: strict review card extraction')

  const raw = await page.evaluate(() => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim()

    // Prefer only true review cards first
    let cards = Array.from(document.querySelectorAll('[data-review-id]'))

    // fallback only if Google did not provide those
    if (!cards.length) {
      cards = Array.from(document.querySelectorAll('div.jftiEf'))
    }

    return cards.map((card, idx) => {
      const reviewId = card.getAttribute('data-review-id') || ''

      const author =
        clean(card.querySelector('.d4r55')?.textContent) ||
        clean(card.querySelector('[class*="d4r55"]')?.textContent) ||
        clean(card.querySelector('.TSUbDb')?.textContent) ||
        ''

      const date =
        clean(card.querySelector('.rsqaWe')?.textContent) ||
        clean(card.querySelector('[class*="rsqaWe"]')?.textContent) ||
        ''

      const ratingLabel =
        card.querySelector('.kvMYJc')?.getAttribute('aria-label') ||
        card.querySelector('[aria-label*="star"]')?.getAttribute('aria-label') ||
        card.querySelector('[aria-label*="Star"]')?.getAttribute('aria-label') ||
        ''

      const text =
        clean(card.querySelector('.wiI7pd')?.innerText) ||
        clean(card.querySelector('[class*="wiI7pd"]')?.innerText) ||
        clean(card.querySelector('[data-expandable-section]')?.innerText) ||
        ''

      return {
        index: idx,
        reviewId,
        author,
        date,
        ratingLabel,
        text,
      }
    })
  })

  const reviews = raw
    .map((r) => ({
      reviewId: r.reviewId || '',
      author: cleanText(r.author),
      date: cleanText(r.date),
      rating: parseRatingFromLabel(r.ratingLabel),
      text: sanitizeReviewText(r.text),
    }))
    .filter((r) => r.text && r.text.length >= MIN_REVIEW_TEXT_LENGTH)

  logger.debug(`Primary extractor found ${raw.length} strict raw cards`)
  logger.debug(`Primary extractor produced ${reviews.length} usable reviews`)

  return dedupeReviews(reviews)
}

// ==========================================================
// EXTRACTION STRATEGY 2 — broader DOM fallback
// ==========================================================
async function extractReviewsSecondary(page) {
  logger.step('Secondary extraction: broader DOM scanning')

  const raw = await page.evaluate(() => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim()

    const possibleBlocks = Array.from(document.querySelectorAll('div, article'))
      .filter((el) => {
        const hasTextNode =
          el.querySelector('.wiI7pd') ||
          el.querySelector('[class*="wiI7pd"]') ||
          el.querySelector('.rsqaWe') ||
          el.querySelector('.kvMYJc') ||
          el.getAttribute('data-review-id')

        return !!hasTextNode
      })
      .slice(0, 200)

    return possibleBlocks.map((block) => {
      const author =
        clean(block.querySelector('.d4r55')?.textContent) ||
        clean(block.querySelector('.TSUbDb')?.textContent) ||
        ''

      const date =
        clean(block.querySelector('.rsqaWe')?.textContent) ||
        clean(block.querySelector('[class*="rsqaWe"]')?.textContent) ||
        ''

      const ratingLabel =
        block.querySelector('.kvMYJc')?.getAttribute('aria-label') ||
        block.querySelector('[aria-label*="star"]')?.getAttribute('aria-label') ||
        ''

      const text =
        clean(block.querySelector('.wiI7pd')?.innerText) ||
        clean(block.querySelector('[class*="wiI7pd"]')?.innerText) ||
        clean(block.querySelector('[data-expandable-section]')?.innerText) ||
        ''

      return {
        author,
        date,
        ratingLabel,
        text,
      }
    })
  })

  const reviews = raw
    .map((r) => ({
      author: cleanText(r.author),
      date: cleanText(r.date),
      rating: parseRatingFromLabel(r.ratingLabel),
      text: sanitizeReviewText(r.text),
    }))
    .filter((r) => r.text && r.text.length >= MIN_REVIEW_TEXT_LENGTH)

  logger.debug(`Secondary extractor produced ${reviews.length} usable reviews`)

  return dedupeReviews(reviews)
}

// ==========================================================
// EXTRACTION STRATEGY 3 — snippet fallback from place page
// ==========================================================
async function extractSnippetFallback(page, businessName = '') {
  logger.step('Fallback extraction: visible review snippets on place page')

  const raw = await page.evaluate((businessNameInner) => {
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim()
    const nameNorm = clean(businessNameInner).toLowerCase()

    const blockedFragments = [
      'saved',
      'recents',
      'get app',
      'collapse side panel',
      'open full screen',
      'share',
      'send to your phone',
      'nearby',
      'directions',
      'website',
      'call',
      'photos',
      'overview',
      'updates',
      'menu',
      'book',
      'people typically spend',
      'suggest an edit',
      'add a missing place',
      'own this business',
      'claim this business',
      'google maps',
      'sort',
      'most relevant',
      'newest',
      'highest',
      'lowest',
      'reviews',
      'review',
      'write a review',
      'based on',
      'stars',
      'collapse',
      'more',
      'see more',
    ]

    const candidates = Array.from(document.querySelectorAll('span, div'))
      .map((el) => clean(el.innerText))
      .filter(Boolean)
      .filter((text) => {
        const lower = text.toLowerCase()

        if (text.length < 20) return false
        if (text.length > 500) return false
        if (lower === nameNorm) return false
        if (nameNorm && lower.includes(nameNorm) && text.length < 60) return false

        if (blockedFragments.some((frag) => lower.includes(frag))) return false

        // Must look like a human sentence
        const wordCount = text.split(/\s+/).length
        if (wordCount < 5) return false

        // Prefer sentence-like snippets
        const hasSentenceShape =
          /[a-z]/i.test(text) &&
          /\s/.test(text) &&
          !/^[A-Z\s\uE000-\uF8FF]+$/.test(text)

        if (!hasSentenceShape) return false

        return true
      })

    const unique = []
    const seen = new Set()

    for (const t of candidates) {
      const key = t.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(t)
    }

    return unique.slice(0, 8)
  }, businessName)

  const reviews = raw
    .map((text, i) => ({
      author: `Snippet ${i + 1}`,
      date: '',
      rating: null,
      text: sanitizeReviewText(text),
    }))
    .filter((r) => r.text && r.text.length >= 20)

  logger.debug(`Snippet fallback produced ${reviews.length} pseudo-reviews`)
  return dedupeReviews(reviews)
}

// ==========================================================
// OPTIONAL SORT ATTEMPT
// ==========================================================
async function trySortReviews(page) {
  logger.step('Trying review sort fallback')

  const openedSort = await page.evaluate(() => {
    const clean = (v) => String(v || '').trim().toLowerCase()
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'))

    const target = buttons.find((el) => {
      const text = clean(el.textContent)
      const aria = clean(el.getAttribute('aria-label'))
      return text.includes('sort') || aria.includes('sort')
    })

    if (!target) return false

    try {
      target.scrollIntoView({ behavior: 'instant', block: 'center' })
      target.click()
      return true
    } catch (_) {
      return false
    }
  })

  if (!openedSort) {
    logger.warn('Sort control not found')
    return false
  }

  await sleep(1200)

  const clickedMenu = await page.evaluate(() => {
    const clean = (v) => String(v || '').trim().toLowerCase()
    const items = Array.from(document.querySelectorAll('[role="menuitem"], li, div'))

    const target =
      items.find((el) => clean(el.textContent).includes('newest')) ||
      items.find((el) => clean(el.textContent).includes('highest')) ||
      items.find((el) => clean(el.textContent).includes('most relevant'))

    if (!target) return false

    try {
      target.click()
      return true
    } catch (_) {
      return false
    }
  })

  if (clickedMenu) {
    logger.ok('Sort option clicked')
    await sleep(2500)
    return true
  }

  logger.warn('Sort menu opened but no option was clicked')
  return false
}

// ==========================================================
// DIAGNOSTICS
// ==========================================================
async function collectDiagnostics(page) {
  try {
    const data = await page.evaluate(() => {
      return {
        title: document.title || '',
        cards: document.querySelectorAll('[data-review-id], div.jftiEf, div.MyEned').length,
        textNodes: document.querySelectorAll('.wiI7pd, [class*="wiI7pd"]').length,
        feedExists: !!document.querySelector('div[role="feed"]'),
        bodyLength: (document.body?.innerText || '').length,
      }
    })

    logger.debug(
      `Diagnostics → title="${data.title}", cards=${data.cards}, textNodes=${data.textNodes}, feed=${data.feedExists}, bodyLength=${data.bodyLength}`
    )

    return data
  } catch (e) {
    logger.warn(`Diagnostics failed: ${e.message}`)
    return {}
  }
}

// ==========================================================
// MAIN SCRAPER
// ==========================================================
async function scrapeReviews(name, googleMapsUrl, businessMeta = {}) {
  let browser = null

  logger.divider(`GOOGLE REVIEWS SCRAPER → ${name}`)

  try {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: DEFAULT_VIEWPORT,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    })

    const page = await browser.newPage()
    await preparePage(page)
    await gotoPlace(page, googleMapsUrl, name)

    await collectDiagnostics(page)

    // ------------------------------------------------------
    // Attempt 1: open reviews tab and extract normally
    // ------------------------------------------------------
    const clickedReviews = await clickReviewsTab(page)

    if (clickedReviews) {
      await waitForReviewContainers(page)
      await expandMoreButtons(page)
      await scrollReviewsPanel(page, MAX_SCROLL_ROUNDS)
      await expandMoreButtons(page)

      const primary = await extractReviewsPrimary(page)
      if (primary.length > 0) {
        logger.ok(`Primary extraction succeeded with ${primary.length} reviews`)
        return {
          success: true,
          reason: '',
          source: 'primary',
          fallback: false,
          reviews: primary,
          inferredPainPoints: [],
        }
      }

      logger.warn('Primary extraction returned 0 reviews')
      const secondary = await extractReviewsSecondary(page)
      if (secondary.length > 0) {
        logger.ok(`Secondary extraction succeeded with ${secondary.length} reviews`)
        return {
          success: true,
          reason: '',
          source: 'secondary',
          fallback: true,
          reviews: secondary,
          inferredPainPoints: [],
        }
      }

      logger.warn('Secondary extraction returned 0 reviews')

      // ----------------------------------------------------
      // Attempt 2: sort reviews and retry
      // ----------------------------------------------------
      const sorted = await trySortReviews(page)
      if (sorted) {
        await waitForReviewContainers(page)
        await expandMoreButtons(page)
        await scrollReviewsPanel(page, 8)
        await expandMoreButtons(page)

        const afterSort = await extractReviewsPrimary(page)
        if (afterSort.length > 0) {
          logger.ok(`Sorted retry succeeded with ${afterSort.length} reviews`)
          return {
            success: true,
            reason: '',
            source: 'sorted-retry',
            fallback: true,
            reviews: afterSort,
            inferredPainPoints: [],
          }
        }

        logger.warn('Sorted retry still produced 0 reviews')
      }
    }

    // ------------------------------------------------------
    // Attempt 3: hard reload + retry once
    // ------------------------------------------------------
    logger.step('Hard reload fallback')

    await page.reload({
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })

    await sleep(3000)

    const clickedAgain = await clickReviewsTab(page)
    if (clickedAgain) {
      await waitForReviewContainers(page)
      await expandMoreButtons(page)
      await scrollReviewsPanel(page, 10)
      await expandMoreButtons(page)

      const retryReviews = await extractReviewsPrimary(page)
      if (retryReviews.length > 0) {
        logger.ok(`Hard reload retry succeeded with ${retryReviews.length} reviews`)
        return {
          success: true,
          reason: '',
          source: 'reload-retry',
          fallback: true,
          reviews: retryReviews,
          inferredPainPoints: [],
        }
      }
    }

    // ------------------------------------------------------
    // Attempt 4: snippet fallback
    // ------------------------------------------------------
const snippets = await extractSnippetFallback(page, name)
  if (snippets.length >= 2) {
  logger.warn(`Using snippet fallback with ${snippets.length} pseudo-reviews`)
  return {
    success: true,
    reason: 'Full review extraction failed; using visible snippet fallback.',
    source: 'snippet-fallback',
    fallback: true,
    reviews: snippets,
    inferredPainPoints: inferPainPointsFromBusinessMeta(businessMeta),
  }
}

logger.warn('Snippet fallback was too weak or too noisy; rejecting it')

    // ------------------------------------------------------
    // Final graceful fallback
    // ------------------------------------------------------
    logger.err('All extraction strategies failed')

    const inferredPainPoints = inferPainPointsFromBusinessMeta(businessMeta)

    return {
      success: false,
      reason: 'No usable reviews could be extracted after all fallback strategies.',
      source: 'none',
      fallback: true,
      reviews: [],
      inferredPainPoints,
    }
  } catch (error) {
    logger.err(`Fatal scraper error: ${error.message}`)

    return {
      success: false,
      reason: error.message || 'Unknown scraping error.',
      source: 'exception',
      fallback: true,
      reviews: [],
      inferredPainPoints: inferPainPointsFromBusinessMeta(businessMeta),
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
      logger.info('Browser closed')
    }

    logger.divider('SCRAPER FINISHED')
  }
}

module.exports = { scrapeReviews }