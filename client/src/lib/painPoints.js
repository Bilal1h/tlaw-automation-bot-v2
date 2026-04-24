export const PAIN_POINT_CATEGORIES = {
  debt_collection: [
    'debt collector',
    'collection agency',
    'collections call',
    'wage garnishment',
    'bank levy',
    'judgement against me',
    'sued for debt',
    'credit card lawsuit',
    'debt lawsuit',
    'sued by capital one',
    'sued by discover',
    'sued by midland',
    'portfolio recovery',
    'lvnv funding',
    'asset acceptance',
    'called constantly',
    'harassing calls',
    'robo calls',
    'automated calls',
    'debt validation',
    "never heard of this debt",
    "debt i don't owe",
    'identity theft debt',
    'old debt',
    'statute of limitations',
    'zombie debt',
  ],

  bankruptcy: [
    "can't pay bills",
    'overwhelmed by debt',
    'drowning in debt',
    'need bankruptcy',
    'chapter 7',
    'chapter 13',
    'filing bankruptcy',
    'fresh start',
    'debt relief',
    "creditors won't stop",
    'repossession',
    'foreclosure',
    'losing my house',
    'car repossessed',
    'wage being garnished',
    "can't afford payments",
  ],

  eviction_tenant: [
    'eviction notice',
    'landlord evicting',
    'got evicted',
    'eviction process',
    '30 day notice',
    '60 day notice',
    'unlawful eviction',
    'retaliatory eviction',
    'security deposit',
    "didn't return deposit",
    'slumlord',
    'habitability',
    'mold in apartment',
    'no heat',
    'broken appliances',
    'lease violation',
    'being sued by landlord',
    'unlawful detainer',
  ],

  employment_law: [
    'wrongful termination',
    'fired unfairly',
    'discriminated at work',
    'harassment',
    'hostile work environment',
    'unpaid wages',
    'overtime not paid',
    'wage theft',
    'FMLA violation',
    'disability discrimination',
    'racial discrimination',
    'retaliation',
    'whistleblower',
    'non-compete clause',
    'severance denied',
    'workers compensation denied',
  ],

  immigration: [
    'visa denied',
    'deportation',
    'removal proceedings',
    'immigration court',
    'asylum',
    'green card denied',
    'work permit',
    'i-485',
    'naturalization',
    'citizenship denied',
    'family petition',
    'undocumented',
    'DACA',
    'TPS',
    'detained by ICE',
    'travel ban',
  ],

  personal_injury: [
    'car accident',
    'slip and fall',
    'injured at work',
    'medical malpractice',
    'dog bite',
    'defective product',
    'nursing home abuse',
    'wrongful death',
    "insurance won't pay",
    'lowball offer',
    'denied claim',
    'hit by car',
    'uber accident',
    'lyft accident',
    'truck accident',
  ],

  poor_communication: [
    'never calls back',
    "doesn't respond",
    'ignoring emails',
    'hard to reach',
    'no communication',
    'takes forever to reply',
    'left in the dark',
    'no updates',
    "didn't keep me informed",
    'ghosted me',
    'stopped responding',
    "can't get through",
    'always voicemail',
    'assistant never helps',
  ],

  high_fees: [
    'too expensive',
    'overpriced',
    'hidden fees',
    'charged too much',
    'surprise billing',
    'excessive fees',
    'nickel and dimed',
    'unexpected charges',
    'inflated invoice',
    'overbilled',
    'billing errors',
    'not worth the cost',
    'charged for things not done',
    'double billed',
  ],

  slow_service: [
    'took too long',
    'months later',
    'still waiting',
    'very slow',
    'no progress',
    'dragging their feet',
    'missed deadlines',
    'delayed',
    'been waiting forever',
    'nothing gets done',
    'stalled my case',
    'no sense of urgency',
    'wasted my time',
  ],

  incompetence: [
    'made mistakes',
    'lost my documents',
    'wrong advice',
    "didn't know what they were doing",
    'inexperienced',
    'amateur',
    'unqualified',
    'gave bad advice',
    'missed filing deadline',
    'lost my case due to',
    "didn't prepare",
    'sent wrong forms',
    'misfiled',
    "didn't read my case",
  ],

  unprofessional: [
    'rude staff',
    'unprofessional',
    'disrespectful',
    'dismissive',
    'condescending',
    'talked down to me',
    "didn't listen",
    'interrupted me',
    "didn't take me seriously",
    'aggressive',
    'toxic office',
    'uncomfortable',
  ],

  trust_issues: [
    'lied to me',
    'dishonest',
    'misleading',
    'bait and switch',
    "promised but didn't deliver",
    'false promises',
    'scam',
    'fraud',
    "didn't disclose",
    'hid information',
    'not transparent',
    'shady',
    'untrustworthy',
    'changed the deal',
    'contract issues',
  ],

  results_disappointing: [
    'lost my case',
    "didn't win",
    'terrible outcome',
    'worst result',
    'no results',
    'nothing changed',
    'waste of money',
    "didn't help",
    'situation got worse',
    "didn't fight for me",
    'gave up too easily',
    'settled without my approval',
    "didn't negotiate",
  ],
}

const RECENT_REVIEW_PATTERNS = [
  'a day ago',
  'days ago',
  'a week ago',
  'weeks ago',
  'a month ago',
  'months ago',
  'edited ',
]

function normalizeText(value = '') {
  return String(value || '').toLowerCase().trim()
}

function humanizeCategory(value = '') {
  return String(value || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function countNegativeReviews(reviewsArray = []) {
  return reviewsArray.filter((review) => Number(review?.rating || 5) <= 3).length
}

function hasRecentNegativeReview(reviewsArray = []) {
  return reviewsArray.some((review) => {
    const isNegative = Number(review?.rating || 5) <= 3
    const dateText = normalizeText(review?.date)
    return isNegative && RECENT_REVIEW_PATTERNS.some((pattern) => dateText.includes(pattern))
  })
}

function detectPartnershipOpportunity(category = '', rating = 0) {
  const value = normalizeText(category)

  const partnershipKeywords = [
    'accountant',
    'accounting',
    'certified public accountant',
    'cpa',
    'tax',
    'financial',
    'bookkeeping',
  ]

  const looksLikePartner = partnershipKeywords.some((keyword) => value.includes(keyword))
  return looksLikePartner && Number(rating || 0) >= 4
}

export function detectPainPoints(reviewsArray = [], meta = {}) {
  const allText = (reviewsArray || [])
    .map((r) => normalizeText(r?.text))
    .join(' ')

  const matched = {}

  for (const [category, keywords] of Object.entries(PAIN_POINT_CATEGORIES)) {
    const hits = keywords.filter((kw) => allText.includes(normalizeText(kw)))

    if (hits.length > 0) {
      matched[category] = {
        hitCount: hits.length,
        matchedPhrases: hits.slice(0, 5),
        severity: Math.min(100, hits.length * 15),
      }
    }
  }

  const negativeReviews = countNegativeReviews(reviewsArray)
  const totalPainHits = Object.values(matched).reduce((sum, item) => sum + item.hitCount, 0)
  const hasPainPoints = Object.keys(matched).length > 0
  const recentNegativeReview = hasRecentNegativeReview(reviewsArray)
  const hasEmail = Boolean(meta?.primaryEmail)
  const hasWebsite = Boolean(meta?.website)
  const reviewCount = Number(meta?.reviewCount || 0)
  const rating = Number(meta?.rating || 0)
  const partnershipOpportunity = detectPartnershipOpportunity(meta?.category, rating)

  let leadScore = 0

  leadScore += Math.min(40, negativeReviews * 12)
  leadScore += Math.min(25, totalPainHits * 4)
  if (hasEmail) leadScore += 20
  if (hasWebsite) leadScore += 10
  if (recentNegativeReview) leadScore += 15
  if (reviewCount >= 10) leadScore += 5

  leadScore = Math.min(100, leadScore)

  let leadType = 'Low Priority'
  if (partnershipOpportunity) {
    leadType = 'Partnership Lead'
  } else if (leadScore >= 75) {
    leadType = 'Hot Lead'
  } else if (leadScore >= 45) {
    leadType = 'Outreach Lead'
  }

  const topCategory =
    Object.entries(matched).sort((a, b) => b[1].hitCount - a[1].hitCount)[0]?.[0] || null

  const reasons = []

  if (negativeReviews > 0) {
    reasons.push(`${negativeReviews} negative review${negativeReviews > 1 ? 's' : ''}`)
  }

  if (topCategory) {
    reasons.push(`${humanizeCategory(topCategory)} complaints`)
  }

  if (hasEmail) {
    reasons.push('public email available')
  }

  if (hasWebsite) {
    reasons.push('website available')
  }

  if (recentNegativeReview) {
    reasons.push('recent negative review')
  }

  if (partnershipOpportunity) {
    reasons.push('strong referral partner category')
  }

  return {
    categories: matched,
    overallScore: Math.min(
      100,
      Object.values(matched).reduce((sum, c) => sum + c.severity, 0),
    ),
    hasPainPoints,
    topCategory,
    leadScore,
    leadType,
    negativeReviews,
    totalPainHits,
    recentNegativeReview,
    partnershipOpportunity,
    reasons,
  }
}

export function getPainPointBadgeColor(score) {
  if (score >= 70) return 'red'
  if (score >= 40) return 'orange'
  if (score > 0) return 'yellow'
  return 'gray'
}

export function getLeadTone(leadType = '', leadScore = 0) {
  if (leadType === 'Partnership Lead') return 'blue'
  if (leadScore >= 75) return 'red'
  if (leadScore >= 45) return 'orange'
  if (leadScore > 0) return 'yellow'
  return 'gray'
}