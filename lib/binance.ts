const LEVERAGED_PATTERN = /3L|3S|UP|DOWN|BULL|BEAR/i;
const STABLECOINS = new Set([
  "USDT",
  "USDC",
  "BUSD",
  "DAI",
  "TUSD",
  "USDP",
  "FDUSD",
  "USDD",
]);
const WRAPPED = new Set(["WBTC", "WETH", "WBNB"]);

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
}

export async function fetchAllUSDTPairs(): Promise<BinanceTicker[]> {
  const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data: BinanceTicker[] = await res.json();

  return data.filter((t) => {
    if (!t.symbol.endsWith("USDT")) return false;
    const base = t.symbol.replace("USDT", "");
    if (LEVERAGED_PATTERN.test(base)) return false;
    if (STABLECOINS.has(base)) return false;
    if (WRAPPED.has(base)) return false;
    return true;
  });
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export async function fetchKlines(
  symbol: string,
  interval: string = "1m",
  limit: number = 1440
): Promise<BinanceKline[]> {
  const pair = `${symbol.toUpperCase()}USDT`;
  const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Binance klines error: ${res.status}`);
  const data: (string | number)[][] = await res.json();

  return data.map((k) => ({
    openTime: k[0] as number,
    open: k[1] as string,
    high: k[2] as string,
    low: k[3] as string,
    close: k[4] as string,
    volume: k[5] as string,
    closeTime: k[6] as number,
  }));
}
