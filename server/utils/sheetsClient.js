const { google } = require('googleapis');
const { oauth2Client } = require('../routes/auth');
const { readTokens, tokensExist, writeTokens } = require('./tokenStore');

async function logToSheet(data) {
  if (!tokensExist()) {
    // eslint-disable-next-line no-console
    console.warn('Not authenticated – skipping sheet log');
    return;
  }

  const tokens = readTokens();
  oauth2Client.setCredentials(tokens);

  oauth2Client.on('tokens', (newTokens) => {
    if (!newTokens) return;
    const merged = { ...tokens, ...newTokens };
    writeTokens(merged);
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const values = [
    [
      data.timestamp,
      data.businessName,
      data.recipientEmail,
      data.subject,
      data.templateId,
      data.city,
      data.state,
      data.status,
      data.notes || '',
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

module.exports = { logToSheet };

