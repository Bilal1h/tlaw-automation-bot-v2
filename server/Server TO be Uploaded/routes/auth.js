const express = require('express');
const { google } = require('googleapis');

const { tokensExist, writeTokens, clearTokens } = require('../utils/tokenStore');

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

router.get('/google', (_req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?status=denied`);
  }
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?status=missing_code`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    writeTokens(tokens);

    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?status=success`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OAuth error:', err);
    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?status=error`);
  }
});

router.get('/status', (_req, res) => {
  res.json({ authenticated: tokensExist() });
});

router.get('/logout', async (_req, res) => {
  try {
    clearTokens();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, oauth2Client };

