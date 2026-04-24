const puppeteer = require('puppeteer')

// ==========================================================
// CONFIG
// ==========================================================
const DEFAULT_LIMIT = 25

// ==========================================================
// PRETTY LOGGER
// ==========================================================
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

function nowTime() {
  return new Date().toLocaleTimeString()
}

function logLine(label, color, msg) {
  console.log(`${color}${C.bold}[${label}]${C.reset} ${C.gray}${nowTime()}${C.reset} ${msg}`)
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
    console.log(`\n${C.bold}${C.white}${line}${C.reset}`)
    if (title) console.log(`${C.bold}${C.white}${title}${C.reset}`)
    console.log(`${C.bold}${C.white}${line}${C.reset}`)
  },
}

// ==========================================================
// HELPERS
// ==========================================================
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function cleanText(text = '') {
  return String(text)
    .replace(/[\uE000-\uF8FF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function dedupeBusinesses(items = []) {
  const seen = new Set()
  const out = []

  for (const item of items) {
    const key =
      (item.googleMapsUrl || '').trim().toLowerCase() ||
      `${(item.name || '').trim().toLowerCase()}|${(item.address || '').trim().toLowerCase()}`

    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }

  return out
}

async function preparePage(page) {
  await page.setViewport({ width: 1440, height: 960 })
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

async function waitForFeed(page) {
  try {
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 })
    return true
  } catch (_) {
    return false
  }
}

async function scrollFeedForLinks(page, targetCount, shouldStop) {
  logger.step(`Scrolling feed to collect up to ${targetCount} place links`)

  let lastCount = 0
  let stableRounds = 0

  for (let i = 0; i < 12; i++) {
    if (shouldStop?.()) {
      logger.warn('Stop requested while scrolling feed')
      break
    }

    const stats = await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]')
      const links = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'))
        .map((a) => a.href)
        .filter(Boolean)

      if (feed) {
        feed.scrollBy(0, 2200)
      } else {
        window.scrollBy(0, 2200)
      }

      return {
        linkCount: links.length,
        hasFeed: !!feed,
      }
    })

    logger.debug(`Feed round ${i + 1}: links=${stats.linkCount}, feed=${stats.hasFeed ? 'yes' : 'no'}`)

    await delay(randomBetween(500, 900))

    if (stats.linkCount >= targetCount) {
      logger.ok(`Enough links found (${stats.linkCount})`)
      break
    }

    if (stats.linkCount === lastCount) {
      stableRounds++
    } else {
      stableRounds = 0
      lastCount = stats.linkCount
    }

    if (stableRounds >= 3) {
      logger.warn('Feed link count stabilized early')
      break
    }
  }
}

async function extractPlaceLinks(page, limit) {
  const links = await page.evaluate((limitInner) => {
    const raw = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'))
      .map((a) => a.href)
      .filter(Boolean)

    const unique = []
    const seen = new Set()

    for (const link of raw) {
      const key = link.split('?')[0]
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(link)
    }

    return unique.slice(0, limitInner)
  }, limit)

  return links
}

async function extractBusinessData(detailPage, link) {
  const data = await detailPage.evaluate(() => {
    const getText = (selector) => document.querySelector(selector)?.innerText || ''
    const getHref = (selector) => document.querySelector(selector)?.href || ''

    const name = getText('h1')

    const ratingText =
      getText('.MW4etd') ||
      getText('[role="main"] .ceNzKf') ||
      ''

    const rating = parseFloat(String(ratingText).replace(/[^\d.]/g, '')) || null

    const reviewText =
      getText('.UY7F9') ||
      getText('button[jsaction*="pane.rating.moreReviews"]') ||
      ''

    const reviewCount = reviewText ? parseInt(String(reviewText).replace(/\D/g, ''), 10) || 0 : 0

    const address =
      getText('button[data-item-id="address"]') ||
      getText('button[aria-label^="Address:"]') ||
      ''

    const phone =
      getText('button[data-item-id^="phone"]') ||
      getText('button[aria-label^="Phone:"]') ||
      ''

    const website =
      getHref('a[data-item-id="authority"]') ||
      getHref('a[aria-label^="Website:"]') ||
      ''

    const category =
      getText('.DkEaL') ||
      getText('button[jsaction*="pane.rating.category"]') ||
      ''

    const cityStateGuess = address || ''

    return {
      name: name || '',
      rating: rating || null,
      reviewCount: reviewCount || 0,
      address: address || '',
      phone: phone || '',
      website: website || '',
      category: category || '',
      cityStateGuess,
    }
  })

  const clean = (v) => cleanText(v)

  return {
    id: makeId(),
    name: clean(data.name),
    rating: data.rating || null,
    reviewCount: data.reviewCount || 0,
    address: clean(data.address),
    phone: clean(data.phone),
    website: data.website || '',
    category: clean(data.category),
    googleMapsUrl: link,
    source: 'google_maps',
  }
}

// ==========================================================
// MAIN
// ==========================================================
async function scrapeGoogleMaps(query, options = {}) {
  const {
    limit = DEFAULT_LIMIT,
    onProgress,
    shouldStop,
  } = options

  let browser = null

  logger.divider(`GOOGLE MAPS SCRAPER → ${query}`)

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    })

    const listPage = await browser.newPage()
    const detailPage = await browser.newPage()

    await preparePage(listPage)
    await preparePage(detailPage)

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`
    logger.step(`Opening search URL`)
    await listPage.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })

    await delay(randomBetween(1200, 1800))

    const feedOk = await waitForFeed(listPage)
    if (!feedOk) {
      throw new Error('Google Maps results feed did not load.')
    }

    await scrollFeedForLinks(listPage, limit, shouldStop)

    let links = await extractPlaceLinks(listPage, limit)
    logger.ok(`Collected ${links.length} place links`)

    if (!links.length) {
      return []
    }

    const results = []

    for (let i = 0; i < links.length; i++) {
      if (shouldStop?.()) {
        logger.warn(`Stop requested after ${results.length} businesses`)
        break
      }

      const link = links[i]
      logger.step(`Opening business ${i + 1}/${links.length}`)

      try {
        await detailPage.goto(link, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        })

        await Promise.race([
          detailPage.waitForSelector('h1', { timeout: 8000 }).catch(() => null),
          detailPage.waitForSelector('button[data-item-id="address"]', { timeout: 8000 }).catch(() => null),
        ])

        await delay(randomBetween(700, 1200))

        let business = await extractBusinessData(detailPage, link)

        // Fallback retry if name/address both missing
        if (!business.name && !business.address) {
          logger.warn(`Weak extraction on ${i + 1}, retrying once`)
          await detailPage.reload({
            waitUntil: 'domcontentloaded',
            timeout: 45000,
          })
          await delay(randomBetween(900, 1400))
          business = await extractBusinessData(detailPage, link)
        }

        if (!business.name) {
          logger.warn(`Skipped empty business at ${i + 1}`)
          continue
        }

        results.push(business)

        const dedupedResults = dedupeBusinesses(results)

        logger.ok(
          `Fetched ${dedupedResults.length}/${links.length} → ${business.name} | rating=${business.rating ?? 'N/A'} | reviews=${business.reviewCount || 0}`
        )

        onProgress?.({
          phase: 'scraping',
          fetchedCount: dedupedResults.length,
          totalDiscovered: links.length,
          latestBusiness: business,
          businesses: dedupedResults,
        })
      } catch (err) {
        logger.warn(`Failed business ${i + 1}/${links.length}: ${err.message}`)
      }
    }

    const finalResults = dedupeBusinesses(results)
    logger.ok(`Finished with ${finalResults.length} businesses`)
    return finalResults
  } catch (err) {
    logger.err(err.message || 'Unknown Google Maps scraping error')
    throw err
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
      logger.info('Browser closed')
    }

    logger.divider('GOOGLE MAPS SCRAPER FINISHED')
  }
}

module.exports = { scrapeGoogleMaps }