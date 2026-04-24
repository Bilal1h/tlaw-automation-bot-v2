const { google } = require('googleapis');
const { oauth2Client } = require('../routes/auth');
const { readTokens, writeTokens, tokensExist } = require('./tokenStore');

function getAuthenticatedGmail() {
  if (!tokensExist()) {
    throw new Error('Not authenticated. Visit /auth/google first.');
  }

  const tokens = readTokens();
  oauth2Client.setCredentials(tokens);

  oauth2Client.on('tokens', (newTokens) => {
    if (!newTokens) return;
    const merged = { ...tokens, ...newTokens };
    writeTokens(merged);
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function sendEmail({ to, subject, body, from }) {
  const gmail = getAuthenticatedGmail();

  const rawMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  return result.data;
}

module.exports = { sendEmail };

