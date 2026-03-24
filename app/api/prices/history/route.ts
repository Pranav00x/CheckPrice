import { NextRequest, NextResponse } from "next/server";
import { initDB, sql } from "@/lib/db";
import { fetchKlines } from "@/lib/binance";
import { getINRRate } from "@/lib/fx";

export const dynamic = "force-dynamic";

const RANGE_MAP: Record<string, { ms: number; interval: string; limit: number }> = {
  "1d": { ms: 86400000, interval: "1m", limit: 1440 },
  "7d": { ms: 604800000, interval: "15m", limit: 672 },
  "30d": { ms: 2592000000, interval: "1h", limit: 720 },
};

export async function GET(req: NextRequest) {
  try {
    await initDB();

    const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
    const range = req.nextUrl.searchParams.get("range") ?? "1d";

    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const config = RANGE_MAP[range] ?? RANGE_MAP["1d"];
    const cutoff = new Date(Date.now() - config.ms);

    const { rows } = await sql`
      SELECT symbol, price_usd, price_inr, volume, timestamp
      FROM price_history
      WHERE symbol = ${symbol} AND timestamp > ${cutoff.toISOString()}
      ORDER BY timestamp ASC
    `;

    if (rows.length < 10) {
      const inrRate = await getINRRate();
      try {
        const klines = await fetchKlines(symbol, config.interval, config.limit);

        if (klines.length > 0) {
          for (let i = 0; i < klines.length; i += 100) {
            const batch = klines.slice(i, i + 100);
            const values = batch
              .map((k) => {
                const priceUsd = parseFloat(k.close);
                const priceInr = priceUsd * inrRate;
                const vol = parseFloat(k.volume);
                const ts = new Date(k.closeTime).toISOString();
                return `('${symbol}', ${priceUsd}, ${priceInr}, ${vol}, '${ts}')`;
              })
              .join(",");

            await sql.query(
              `INSERT INTO price_history (symbol, price_usd, price_inr, volume, timestamp) VALUES ${values} ON CONFLICT DO NOTHING`
            );
          }

          const { rows: newRows } = await sql`
            SELECT symbol, price_usd, price_inr, volume, timestamp
            FROM price_history
            WHERE symbol = ${symbol} AND timestamp > ${cutoff.toISOString()}
            ORDER BY timestamp ASC
          `;

          return NextResponse.json(
            newRows.map((r) => ({
              timestamp: r.timestamp,
              price_usd: parseFloat(r.price_usd),
              price_inr: parseFloat(r.price_inr),
              volume: parseFloat(r.volume),
            }))
          );
        }
      } catch (e) {
        console.error("Kline fetch error:", e);
      }
    }

    return NextResponse.json(
      rows.map((r) => ({
        timestamp: r.timestamp,
        price_usd: parseFloat(r.price_usd),
        price_inr: parseFloat(r.price_inr),
        volume: parseFloat(r.volume),
      }))
    );
  } catch (err) {
    console.error("History API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
