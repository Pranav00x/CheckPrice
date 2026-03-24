import { kv } from "@vercel/kv";

export { kv };

export async function getMarketSnapshot(): Promise<CoinData[] | null> {
  return kv.get<CoinData[]>("market:snapshot");
}

export async function setMarketSnapshot(data: CoinData[]): Promise<void> {
  await kv.set("market:snapshot", data, { ex: 90 });
}

export async function getInrRate(): Promise<number | null> {
  const rate = await kv.get<string>("fx:inr_rate");
  return rate ? parseFloat(rate) : null;
}

export async function setInrRate(rate: number): Promise<void> {
  await kv.set("fx:inr_rate", String(rate), { ex: 3600 });
}

export async function getCoinMeta(): Promise<Record<string, CoinMeta> | null> {
  return kv.get<Record<string, CoinMeta>>("coin:meta");
}

export async function setCoinMeta(
  meta: Record<string, CoinMeta>
): Promise<void> {
  await kv.set("coin:meta", meta, { ex: 86400 });
}

export interface CoinMeta {
  name: string;
  logo_url: string;
}

export interface CoinData {
  symbol: string;
  name: string;
  price_usd: number;
  price_inr: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  source: "binance" | "coingecko";
  updated_at: string;
}
