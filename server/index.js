require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/search', require('./routes/search'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/email', require('./routes/email'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/bulk-email', require('./routes/bulkEmail'))
app.use('/auth', require('./routes/auth').router);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TariqLaw server running on port ${port}`);
});

