const axios = require('axios');
const cheerio = require('cheerio');
const {
  extractEmailsFromText,
  pickPrimaryEmail
} = require('../utils/emailExtractor');

function normalizeUrl(url) {
  if (!url) return '';
  if (!url.startsWith('http')) return 'https://' + url;
  return url;
}

function buildUrls(base) {
  return [
    base,
    base + '/contact',
    base + '/contact-us',
    base + '/about',
    base + '/about-us'
  ];
}

async function fetchPage(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    return res.data;
  } catch {
    return '';
  }
}

function extractFromCheerio($) {
  let emails = [];

  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href');
    const email = href.replace('mailto:', '').split('?')[0];
    emails.push(email);
  });

  return emails;
}

async function scrapeBusinessEmails(website) {
  const base = normalizeUrl(website);
  const urls = buildUrls(base);

  let allEmails = [];
  let source = '';

  for (let url of urls) {
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);

    const emails = [
      ...extractFromCheerio($),
      ...extractEmailsFromText(html),
      ...extractEmailsFromText($('body').text())
    ];

    if (emails.length) {
      allEmails.push(...emails);
      source = url;
    }
  }

  allEmails = [...new Set(allEmails)];

  return {
    success: true,
    emails: allEmails,
    primaryEmail: pickPrimaryEmail(allEmails, website),
    sourceUrl: source
  };
}

module.exports = { scrapeBusinessEmails };