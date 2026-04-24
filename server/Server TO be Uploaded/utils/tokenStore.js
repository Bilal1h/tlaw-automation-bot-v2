const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.resolve(__dirname, '..', 'tokens.json');

function tokensExist() {
  return fs.existsSync(TOKENS_PATH);
}

function readTokens() {
  if (!tokensExist()) return null;
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
}

function writeTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

function clearTokens() {
  if (tokensExist()) fs.unlinkSync(TOKENS_PATH);
}

module.exports = {
  TOKENS_PATH,
  tokensExist,
  readTokens,
  writeTokens,
  clearTokens,
};

