# Tranzo — Crypto Price Feed

Real-time crypto price dashboard covering 400+ coins via Binance and CoinGecko.
AMOLED terminal aesthetic. Built for the Tranzo payments wallet.

## Stack

- Next.js 14 (App Router, TypeScript)
- Vercel KV (Upstash Redis) — market snapshot cache
- Vercel Postgres (Neon) — on-demand price history
- Vercel Cron Jobs — automated ingestion
- TradingView Lightweight Charts — charting
- Binance REST API — primary price source
- CoinGecko API — supplementary market data
- react-window — virtualized coin list

## Setup

1. Clone and install:
   ```
   git clone https://github.com/Pranav00x/CheckPrice.git
   cd CheckPrice
   npm install
   ```

2. Create Vercel project and link:
   ```
   vercel link
   ```

3. In Vercel dashboard, create:
   - Storage → KV store
   - Storage → Postgres database

4. Pull env vars:
   ```
   vercel env pull .env.local
   ```

5. Add these manually to `.env.local`:
   - `EXCHANGE_RATE_API_KEY` — from exchangerate-api.com (free)
   - `CRON_SECRET` — any random string (`openssl rand -hex 32`)

6. Run locally:
   ```
   vercel dev
   ```

7. Deploy:
   ```
   vercel deploy
   ```

Crons activate automatically after first deploy.
Postgres tables auto-created on first cron run.
