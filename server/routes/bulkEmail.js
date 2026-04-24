const express = require('express')
const router = express.Router()
const { sendEmail } = require('../utils/gmailClient')
const { logToSheet } = require('../utils/sheetsClient')
const { EMAIL_TEMPLATES } = require('../templates/emailTemplates')

function fillTemplate(str = '', values = {}) {
  return String(str).replace(/{{(.*?)}}/g, (_, key) => values[key.trim()] ?? '')
}

router.post('/send', async (req, res) => {
  const {
    businesses = [],
    templateId = 'general_002',
    senderName = 'TariqLaw Team',
    senderPhone = '',
  } = req.body

  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)

  if (!template) {
    return res.status(400).json({ success: false, error: 'Template not found' })
  }

  const results = []

  for (const business of businesses) {
    try {
      if (!business?.primaryEmail) {
        results.push({
          businessName: business?.name || '',
          email: '',
          status: 'SKIPPED',
          reason: 'No primary email',
        })
        continue
      }

      const values = {
        recipientName: business?.name || 'there',
        businessName: business?.name || '',
        businessType: business?.category || 'business',
        city: business?.city || '',
        state: business?.state || '',
        painPointSummary: business?.painPointSummary || 'customer concerns',
        senderName,
        senderPhone,
      }

      const subject = fillTemplate(template.subject, values)
      const body = fillTemplate(template.body, values)

      await sendEmail({
        to: business.primaryEmail,
        subject,
        body,
        from: `TariqLaw <me>`,
      })

      await logToSheet({
        timestamp: new Date().toISOString(),
        businessName: business?.name || '',
        recipientEmail: business.primaryEmail,
        subject,
        templateId,
        city: business?.city || '',
        state: business?.state || '',
        status: 'SENT',
        notes: 'Bulk automation',
      })

      results.push({
        businessName: business?.name || '',
        email: business.primaryEmail,
        status: 'SENT',
      })
    } catch (error) {
      results.push({
        businessName: business?.name || '',
        email: business?.primaryEmail || '',
        status: 'FAILED',
        reason: error.message,
      })
    }
  }

  res.json({
    success: true,
    total: businesses.length,
    sent: results.filter((r) => r.status === 'SENT').length,
    failed: results.filter((r) => r.status === 'FAILED').length,
    skipped: results.filter((r) => r.status === 'SKIPPED').length,
    results,
  })
})

module.exports = router