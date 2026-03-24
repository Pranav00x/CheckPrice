import { getInrRate, setInrRate } from "./kv";

const FALLBACK_RATE = 83.5;

export async function getINRRate(): Promise<number> {
  const cached = await getInrRate();
  if (cached) return cached;

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) return FALLBACK_RATE;

    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/INR`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return FALLBACK_RATE;

    const data = await res.json();
    const rate = data.conversion_rate ?? FALLBACK_RATE;
    await setInrRate(rate);
    return rate;
  } catch {
    return FALLBACK_RATE;
  }
}
