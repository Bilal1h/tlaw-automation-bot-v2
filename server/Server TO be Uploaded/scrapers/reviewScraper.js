const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrapeReviews(_businessName, googleMapsUrl, { maxReviews = 50 } = {}) {
  if (!googleMapsUrl) return [];

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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    );

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(googleMapsUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    await sleep(800 + Math.random() * 600);

    const clicked = await page
      .$eval('button[aria-label*="Reviews"]', (btn) => {
        btn.click();
        return true;
      })
      .catch(() => false);

    if (clicked) {
      await sleep(1500 + Math.random() * 800);
    }

    for (let i = 0; i < 6; i += 1) {
      await page.evaluate(() => {
        const panel =
          document.querySelector('[role="main"]') ||
          document.querySelector('div[role="region"]') ||
          document.body;
        panel?.scrollBy(0, 2200);
      });
      await sleep(900 + Math.random() * 500);
    }

    const reviews = await page.evaluate((maxReviews) => {
      const reviewEls = document.querySelectorAll('[data-review-id]');
      return Array.from(reviewEls)
        .slice(0, maxReviews)
        .map((el) => ({
          author: el.querySelector('.d4r55')?.innerText || '',
          rating: el.querySelectorAll('.elGi1d').length || null,
          text: el.querySelector('.wiI7pd')?.innerText || '',
          date: el.querySelector('.rsqaWe')?.innerText || '',
        }));
    }, maxReviews);

    return reviews;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeReviews };

