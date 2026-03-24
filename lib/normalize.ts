import type { BinanceTicker } from "./binance";
import type { GeckoMarketCoin } from "./coingecko";
import type { CoinData, CoinMeta } from "./kv";

export function normalizeBinanceTicker(
  ticker: BinanceTicker,
  inrRate: number,
  meta: Record<string, CoinMeta> | null
): CoinData {
  const symbol = ticker.symbol.replace("USDT", "");
  const priceUsd = parseFloat(ticker.lastPrice);
  const coinMeta = meta?.[symbol.toLowerCase()];

  return {
    symbol,
    name: coinMeta?.name ?? symbol,
    price_usd: priceUsd,
    price_inr: priceUsd * inrRate,
    change_24h: parseFloat(ticker.priceChangePercent),
    volume_24h: parseFloat(ticker.quoteVolume),
    market_cap: 0,
    source: "binance",
    updated_at: new Date().toISOString(),
  };
}

export function normalizeGeckoCoin(
  coin: GeckoMarketCoin,
  inrRate: number
): CoinData {
  return {
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price_usd: coin.current_price,
    price_inr: coin.current_price * inrRate,
    change_24h: coin.price_change_percentage_24h ?? 0,
    volume_24h: coin.total_volume,
    market_cap: coin.market_cap,
    source: "coingecko",
    updated_at: new Date().toISOString(),
  };
}
