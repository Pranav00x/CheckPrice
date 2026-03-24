import { sql } from "@vercel/postgres";

let initialized = false;

export async function initDB(): Promise<void> {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS price_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      symbol TEXT NOT NULL,
      price_usd NUMERIC NOT NULL,
      price_inr NUMERIC NOT NULL,
      volume NUMERIC NOT NULL DEFAULT 0,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_price_history_symbol_ts
    ON price_history (symbol, timestamp DESC)
  `;
  initialized = true;
}

export { sql };
