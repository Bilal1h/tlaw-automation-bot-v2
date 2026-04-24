# TariqLaw Lead Generation & Cold Email Automation Engine

Full-stack internal tool for TariqLaw.com:

- Scrape Google Maps business listings (Puppeteer, no paid APIs)
- Fetch reviews and detect pain points (hardcoded keyword engine)
- Send personalized emails through Gmail OAuth2
- Log outreach to Google Sheets

## Setup

### 1) Backend

1. Copy `server/.env.example` → `server/.env` and fill in Google OAuth + `SPREADSHEET_ID`.
2. Install and run:

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

1. Copy `client/.env.example` → `client/.env` (optional).
2. Install and run:

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3) Connect Gmail

Open `http://localhost:5000/auth/google` and finish OAuth.

## Notes

- `server/tokens.json` is created after OAuth. It is ignored by git via `.gitignore`.

