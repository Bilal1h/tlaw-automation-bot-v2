const puppeteer = require('puppeteer');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function autoScrollFeed(page, { maxScrollPx = 15000, stepPx = 600, delayMs = 650 } = {}) {
  await page.evaluate(
    async ({ maxScrollPx, stepPx, delayMs }) => {
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return;
      await new Promise((resolve) => {
        let total = 0;
        const timer = setInterval(() => {
          feed.scrollBy(0, stepPx);
          total += stepPx;
          if (total >= maxScrollPx) {
            clearInterval(timer);
            resolve();
          }
        }, delayMs);
      });
    },
    { maxScrollPx, stepPx, delayMs },
  );
}

async function scrapeGoogleMaps(query, { maxResults = 60 } = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    await page.waitForSelector('[role="feed"]', { timeout: 20000 });
    await sleep(800 + Math.random() * 600);

    await autoScrollFeed(page);
    await sleep(500 + Math.random() * 400);

    const businesses = await page.evaluate((maxResults) => {
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return [];

      const cards = Array.from(feed.querySelectorAll('a[href*="/maps/place/"]'))
        .map((a) => a.closest('[role="article"]') || a.closest('div'))
        .filter(Boolean);

      const uniq = [];
      const seen = new Set();
      for (const c of cards) {
        const key = c?.innerText?.slice(0, 80) || '';
        if (!key || seen.has(key)) continue;
        seen.add(key);
        uniq.push(c);
        if (uniq.length >= maxResults) break;
      }

      return uniq
        .map((card) => {
          const nameEl = card.querySelector('.fontHeadlineSmall');
          const ratingEl = card.querySelector('.MW4etd');
          const reviewCountEl = card.querySelector('.UY7F9');
          const websiteEl = card.querySelector('a[data-value="Website"]');
          const phoneEl = card.querySelector('[data-tooltip="Copy phone number"]');
          const placeLinkEl = card.querySelector('a[href*="/maps/place/"]');

          const name = nameEl?.innerText?.trim() || '';
          if (!name) return null;

          // Address/category are not consistently in the same selectors across layouts.
          // We keep them best-effort from visible text blocks.
          const metaLines = Array.from(card.querySelectorAll('.W4Efsd'))
            .map((el) => el.innerText?.trim())
            .filter(Boolean);
          const address = metaLines.find((l) => /\d/.test(l) && /[A-Za-z]/.test(l)) || '';
          const category = metaLines.find((l) => !/\d/.test(l) && l.length < 60) || '';

          const reviewCountRaw = reviewCountEl?.innerText?.replace(/[()]/g, '') || '';
          const reviewCount = parseInt(reviewCountRaw.replace(/[^\d]/g, ''), 10) || 0;

          const rating = parseFloat(ratingEl?.innerText) || null;
          const googleMapsUrl = placeLinkEl?.href || '';

          return {
            id: Math.random().toString(36).slice(2, 11),
            name,
            rating,
            reviewCount,
            address,
            phone: phoneEl?.innerText?.trim() || '',
            category,
            website: websiteEl?.href || '',
            googleMapsUrl,
          };
        })
        .filter(Boolean);
    }, maxResults);

    return businesses;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeGoogleMaps };

