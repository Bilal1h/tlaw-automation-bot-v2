function normalizeEmail(email = '') {
  return String(email)
    .trim()
    .toLowerCase()
    .replace(/^mailto:/i, '')
    .replace(/[<>"'(),;]+/g, '')
    .trim();
}

function getDomainFromUrl(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isBlockedEmail(email = '') {
  const blockedExact = new Set([
    'user@domain.com',
    'name@domain.com',
    'email@domain.com',
    'example@example.com',
    'example@domain.com',
    'test@test.com',
    'test@example.com',
    'yourname@domain.com',
    'youremail@domain.com',
    'sample@domain.com',
    'demo@domain.com',
  ]);

  const blockedContains = [
    'user@domain',
    'name@domain',
    'example@',
    'test@',
    'noreply@',
    'no-reply@',
    '@sentry.io',
    '@example.',
    '.png@',
    '.jpg@',
    '.jpeg@',
    '.gif@',
    '.webp@',
    '.svg@',
    '.css@',
    '.js@',
  ];

  if (blockedExact.has(email)) return true;
  if (blockedContains.some((part) => email.includes(part))) return true;

  return false;
}

function looksBroken(email = '') {
  if (!email.includes('@')) return true;

  const parts = email.split('@');
  if (parts.length !== 2) return true;

  const [local, domain] = parts;

  if (!local || !domain) return true;
  if (local.length > 64 || domain.length > 255) return true;

  if (email.includes('..')) return true;
  if (/^\d{5,}[a-z]/i.test(local)) return true;

  return false;
}

function isValidEmail(email = '') {
  const value = normalizeEmail(email);

  const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!regex.test(value)) return false;
  if (isBlockedEmail(value)) return false;
  if (looksBroken(value)) return false;

  return true;
}

function extractEmailsFromText(text = '') {
  if (!text) return [];

  const matches =
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || [];

  return [...new Set(matches.map(normalizeEmail).filter(isValidEmail))];
}

function scoreEmail(email, domain) {
  let score = 0;

  if (!email) return score;

  const [localPart, domainPart] = email.split('@');

  if (domain && domainPart === domain) score += 50;

  const strongPrefixes = ['info', 'contact', 'hello', 'support', 'admin', 'office', 'intake'];
  const mediumPrefixes = ['team', 'legal', 'help', 'service', 'billing'];

  if (strongPrefixes.includes(localPart)) score += 30;
  if (mediumPrefixes.includes(localPart)) score += 20;

  if (['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'].includes(domainPart)) {
    score += 5;
  }

  return score;
}

function pickPrimaryEmail(emails = [], website = '') {
  const domain = getDomainFromUrl(website);

  return emails
    .filter(isValidEmail)
    .map((email) => ({ email, score: scoreEmail(email, domain) }))
    .sort((a, b) => b.score - a.score)[0]?.email || '';
}

module.exports = {
  extractEmailsFromText,
  pickPrimaryEmail,
  isValidEmail,
};