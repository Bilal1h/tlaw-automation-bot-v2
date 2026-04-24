const EMAIL_TEMPLATES = [
  // ─── DEBT DEFENSE (1-4) ──────────────────────────────────
  {
    id: 'debt_001',
    name: 'Debt Collection Harassment',
    category: 'debt_collection',
    subject: 'Re: Legal Help for Debt Collection Issues – TariqLaw',
    body: `Hi {{recipientName}},

I came across your business while researching {{businessType}} firms in {{city}}, and I noticed some clients have mentioned challenges with debt collection pressure.

At TariqLaw, we specialize in protecting small business owners and individuals from aggressive debt collectors. Under the Fair Debt Collection Practices Act (FDCPA), you may have rights you're not aware of — including the right to stop collector calls immediately.

We've helped clients in {{state}} eliminate debt harassment, negotiate settlements at a fraction of the original amount, and in some cases, receive compensation from collectors who broke the law.

Would you be open to a free 15-minute consultation this week? There's no obligation and no cost.

Best regards,
{{senderName}}
TariqLaw.com
{{senderPhone}}`,
  },
  {
    id: 'debt_002',
    name: 'Debt Lawsuit Response',
    category: 'debt_collection',
    subject: 'You May Have More Options Than You Think – TariqLaw',
    body: `Hi {{recipientName}},

If you or someone you work with has been served with a debt lawsuit, you have only a limited time to respond — but the good news is that most people have far more options than they realize.

At TariqLaw, we handle debt defense cases throughout {{state}}. Many clients who thought they had no choice end up settling for significantly less, or having cases dismissed entirely.

We offer a free case review. No upfront fees for qualified cases.

Can we schedule 15 minutes this week?

Warm regards,
{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'debt_003',
    name: 'Wage Garnishment',
    category: 'debt_collection',
    subject: 'Stop Wage Garnishment – We Can Help | TariqLaw',
    body: `Hello {{recipientName}},

Wage garnishment can be devastating — but in many cases, it can be stopped or significantly reduced, even after it has already started.

TariqLaw's debt defense team has helped clients in {{city}} and surrounding areas challenge garnishments, file for exemptions, and negotiate directly with creditors to protect their income.

If this is something your business or clients are dealing with, we'd love to offer a free consultation.

{{senderName}}
TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'debt_004',
    name: 'Business Debt Relief',
    category: 'debt_collection',
    subject: 'Business Debt Getting Out of Control? TariqLaw Can Help',
    body: `Hi {{recipientName}},

Running a {{businessType}} business in {{city}} is already challenging — dealing with mounting business debt on top of that can feel impossible.

At TariqLaw, we help business owners restructure, negotiate, and legally manage commercial debt. Whether it's vendor disputes, bank pressure, or SBA loans, we've seen it all.

Let's talk — completely free, no pressure.

{{senderName}} | TariqLaw.com`,
  },

  // ─── EVICTION / TENANT LAW (5-7) ─────────────────────────
  {
    id: 'eviction_001',
    name: 'Landlord Eviction Defense',
    category: 'eviction_tenant',
    subject: 'Facing Eviction? Know Your Rights First – TariqLaw',
    body: `Hi {{recipientName}},

Receiving an eviction notice is stressful — but it doesn't always mean you have to leave. Many eviction notices are procedurally defective and can be challenged.

TariqLaw represents tenants throughout {{state}} who are facing unlawful or improper evictions. We offer immediate consultations for urgent situations.

Please reach out before taking any action — the steps you take in the first 48 hours matter enormously.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'eviction_002',
    name: 'Security Deposit Recovery',
    category: 'eviction_tenant',
    subject: "Landlord Keeping Your Deposit? We Can Help Get It Back",
    body: `Hello {{recipientName}},

If your landlord has withheld your security deposit without proper justification, you may be entitled to recover not just the deposit — but additional damages under {{state}} law.

TariqLaw handles security deposit disputes and tenant rights cases. Many cases resolve quickly, and we work on contingency for qualifying cases.

{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'eviction_003',
    name: 'Commercial Lease Dispute',
    category: 'eviction_tenant',
    subject: 'Commercial Lease Issues? TariqLaw Can Help',
    body: `Hi {{recipientName}},

As a {{businessType}} business owner in {{city}}, your lease is one of your most important legal documents. Disputes with landlords over commercial leases can threaten your entire operation.

TariqLaw's team handles commercial lease reviews, breach of contract disputes, and wrongful eviction defense for business tenants.

Let's protect your business. Free initial consultation available this week.

{{senderName}} | TariqLaw.com`,
  },

  // ─── EMPLOYMENT LAW (8-10) ───────────────────────────────
  {
    id: 'employment_001',
    name: 'Wrongful Termination',
    category: 'employment_law',
    subject: "Were You Wrongfully Terminated? TariqLaw Can Review Your Case",
    body: `Hi {{recipientName}},

If you've recently been let go under circumstances that felt unfair or retaliatory, you may have a wrongful termination claim — even in an at-will employment state.

TariqLaw's employment attorneys in {{state}} evaluate these cases regularly. Timing matters: employment claims have strict filing deadlines.

Book a free 20-minute consultation today.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'employment_002',
    name: 'Unpaid Wages',
    category: 'employment_law',
    subject: 'Unpaid Wages or Overtime? You Have Rights – TariqLaw',
    body: `Hello {{recipientName}},

Wage theft is more common than most people realize — and it's illegal. Whether it's unpaid overtime, missed breaks, or withheld final paychecks, {{state}} law provides strong protections.

TariqLaw helps workers in {{city}} recover what they're owed, often with no upfront cost.

Reach out for a free case review.

{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'employment_003',
    name: 'Workplace Discrimination',
    category: 'employment_law',
    subject: 'Experienced Discrimination at Work? TariqLaw Is Here',
    body: `Hi {{recipientName}},

Workplace discrimination based on race, gender, age, disability, or religion is illegal — and you don't have to accept it.

TariqLaw represents employees in discrimination cases throughout {{state}}. We handle EEOC filings, negotiations, and litigation.

Your consultation is completely free and confidential.

{{senderName}} | TariqLaw.com`,
  },

  // ─── IMMIGRATION (11-12) ─────────────────────────────────
  {
    id: 'immigration_001',
    name: 'Immigration Consultation',
    category: 'immigration',
    subject: 'Immigration Questions? TariqLaw Offers Free Consultations',
    body: `Hi {{recipientName}},

Whether you're dealing with a visa issue, family petition, or removal proceedings, navigating the immigration system alone is incredibly difficult.

TariqLaw's immigration team serves clients across {{state}} with compassionate, knowledgeable representation. We speak your language — literally and figuratively.

Free consultation available. Reach out today.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'immigration_002',
    name: 'DACA / Work Permit',
    category: 'immigration',
    subject: 'DACA Renewal or Work Authorization Help | TariqLaw',
    body: `Hello {{recipientName}},

With ongoing changes to DACA and work authorization programs, staying on top of renewals and applications is critical.

TariqLaw handles DACA renewals, Employment Authorization Documents (EADs), and related immigration filings throughout {{state}}.

Don't risk a lapse in your status. Contact us today for a free review.

{{senderName}} | TariqLaw.com`,
  },

  // ─── GENERAL / OUTREACH (13-17) ──────────────────────────
  {
    id: 'general_001',
    name: 'General Legal Services Introduction',
    category: 'general',
    subject: 'Legal Support for {{businessType}} Businesses in {{city}} | TariqLaw',
    body: `Hi {{recipientName}},

I'm reaching out because I noticed your {{businessType}} business in {{city}} may benefit from having reliable legal support on call.

TariqLaw provides legal services to small and medium businesses including contract review, employee disputes, debt matters, and compliance guidance.

We offer flexible arrangements and a free initial consultation for new clients.

Would you be open to a brief call this week?

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'general_002',
    name: 'Review-Based Outreach (Pain Point Specific)',
    category: 'general',
    subject: 'We Noticed Something in Your Reviews – We May Be Able to Help',
    body: `Hi {{recipientName}},

I was researching {{businessType}} businesses in {{city}} and noticed that some of your recent reviews mention {{painPointSummary}}.

This is actually a legal issue that TariqLaw specializes in. We've helped similar businesses in {{state}} resolve these situations quickly and professionally.

I'd love to share how we've helped others in your exact situation. Free 15-minute call?

{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'general_003',
    name: 'Follow-Up Email',
    category: 'general',
    subject: 'Following Up – TariqLaw',
    body: `Hi {{recipientName}},

Just following up on my previous note. I know things get busy — I wanted to make sure this didn't fall through the cracks.

TariqLaw offers free initial consultations and we'd genuinely love to learn more about your situation to see if we can help.

No pressure at all — just let me know if you'd like to connect.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'general_004',
    name: 'Referral Partnership Outreach',
    category: 'general',
    subject: 'Referral Partnership Opportunity | TariqLaw',
    body: `Hi {{recipientName}},

I'm reaching out because I think there's a natural synergy between {{businessType}} professionals and what we do at TariqLaw.

Many of your clients likely face legal challenges — debt, employment disputes, lease issues — that we specialize in. We'd love to explore a referral arrangement that would add value to your clients.

Would you be open to a 20-minute call to explore this?

{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'general_005',
    name: 'Contract Review Offer',
    category: 'general',
    subject: 'Free Contract Review for {{businessType}} Businesses | TariqLaw',
    body: `Hi {{recipientName}},

Are your business contracts actually protecting you? Many small business owners in {{city}} are unknowingly exposed to significant legal risk through poorly drafted agreements.

TariqLaw is offering a free contract review for {{businessType}} businesses this month. We'll flag any red flags and give you honest, practical advice.

No obligation. Reply to this email or call {{senderPhone}} to schedule.

{{senderName}} | TariqLaw.com`,
  },

  // ─── PERSONAL INJURY (18-20) ─────────────────────────────
  {
    id: 'injury_001',
    name: 'Accident / Injury Introduction',
    category: 'personal_injury',
    subject: "Injured? Don't Accept the First Settlement Offer | TariqLaw",
    body: `Hi {{recipientName}},

If you or someone you know has been injured in an accident in {{city}}, the insurance company's first offer is almost never the best offer.

TariqLaw's personal injury team fights for full compensation — medical bills, lost income, and pain and suffering. We work on contingency: you pay nothing unless we win.

Free consultation available 7 days a week.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
  {
    id: 'injury_002',
    name: "Workers Comp Denial",
    category: 'personal_injury',
    subject: "Workers' Comp Claim Denied? TariqLaw Can Help",
    body: `Hello {{recipientName}},

A denied workers' compensation claim doesn't have to be the final word. Many legitimate claims are initially denied, but with proper legal representation, they can be successfully appealed.

TariqLaw handles workers' comp disputes throughout {{state}}. Our consultation is free and we only get paid if you win.

{{senderName}} | TariqLaw.com`,
  },
  {
    id: 'injury_003',
    name: 'Slip and Fall / Premises Liability',
    category: 'personal_injury',
    subject: "Injured on Someone Else's Property? Know Your Rights | TariqLaw",
    body: `Hi {{recipientName}},

Slip-and-fall injuries and premises liability cases can result in significant compensation — but you must act quickly before evidence disappears.

TariqLaw's team handles these cases throughout {{state}} on a contingency basis. Free case review available now.

{{senderName}} | TariqLaw.com | {{senderPhone}}`,
  },
];

module.exports = { EMAIL_TEMPLATES };

