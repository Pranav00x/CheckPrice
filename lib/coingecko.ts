export interface GeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export async function fetchTop250(): Promise<GeckoMarketCoin[]> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1";
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CoinGecko markets error: ${res.status}`);
  return res.json();
}

export interface GeckoCoinListItem {
  id: string;
  symbol: string;
  name: string;
}

export async function fetchCoinList(): Promise<GeckoCoinListItem[]> {
  const url = "https://api.coingecko.com/api/v3/coins/list";
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CoinGecko list error: ${res.status}`);
  return res.json();
}
