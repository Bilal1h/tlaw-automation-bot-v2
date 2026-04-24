const express = require('express');
const { EMAIL_TEMPLATES } = require('../templates/emailTemplates');
const { sendEmail } = require('../utils/gmailClient');
const { logToSheet } = require('../utils/sheetsClient');
const { authCheck } = require('../middleware/authCheck');

const router = express.Router();

// GET /api/email/templates
router.get('/templates', (_req, res) => {
  res.json({
    templates: EMAIL_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      subject: t.subject,
    })),
  });
});

const fillTemplate = (str, vars) =>
  String(str || '')
    .replace(/{{recipientName}}/g, vars.recipientName || 'there')
    .replace(/{{businessName}}/g, vars.businessName || '')
    .replace(/{{businessType}}/g, vars.businessType || 'business')
    .replace(/{{city}}/g, vars.city || '')
    .replace(/{{state}}/g, vars.state || '')
    .replace(/{{painPointSummary}}/g, vars.painPointSummary || 'customer concerns')
    .replace(/{{senderName}}/g, vars.senderName || 'TariqLaw Team')
    .replace(/{{senderPhone}}/g, vars.senderPhone || '');

// POST /api/email/send
router.post('/send', authCheck, async (req, res) => {
  const {
    templateId,
    recipientEmail,
    recipientName,
    businessName,
    businessType,
    city,
    state,
    painPointSummary,
    senderName,
    senderPhone,
    customSubject,
    customBody,
  } = req.body || {};

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Missing recipientEmail' });
  }

  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  if (!template && !customBody) {
    return res.status(400).json({ error: 'Template not found (and no customBody provided)' });
  }

  const vars = {
    recipientName,
    businessName,
    businessType,
    city,
    state,
    painPointSummary,
    senderName,
    senderPhone,
  };

  const subject = customSubject || fillTemplate(template?.subject, vars);
  const body = customBody || fillTemplate(template?.body, vars);

  try {
    await sendEmail({
      to: recipientEmail,
      subject,
      body,
      from: 'TariqLaw <me>',
    });

    await logToSheet({
      timestamp: new Date().toISOString(),
      businessName: businessName || '',
      recipientEmail,
      subject,
      templateId: templateId || 'custom',
      city: city || '',
      state: state || '',
      status: 'SENT',
      notes: '',
    });

    return res.json({ success: true, message: 'Email sent and logged.' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

