import { NextRequest, NextResponse } from "next/server";
import { fetchAllUSDTPairs } from "@/lib/binance";
import { normalizeBinanceTicker } from "@/lib/normalize";
import { getINRRate } from "@/lib/fx";
import {
  getMarketSnapshot,
  setMarketSnapshot,
  getCoinMeta,
} from "@/lib/kv";
import { initDB, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inrRate = await getINRRate();
    const tickers = await fetchAllUSDTPairs();
    const meta = await getCoinMeta();

    const binanceCoins = tickers.map((t) =>
      normalizeBinanceTicker(t, inrRate, meta)
    );

    const existingSnapshot = await getMarketSnapshot();
    const binanceSymbols = new Set(binanceCoins.map((c) => c.symbol));

    const geckoOnlyCoins = (existingSnapshot ?? []).filter(
      (c) => c.source === "coingecko" && !binanceSymbols.has(c.symbol)
    );

    const mergedCoins = [...binanceCoins, ...geckoOnlyCoins];

    if (existingSnapshot) {
      const capMap = new Map(
        existingSnapshot
          .filter((c) => c.market_cap > 0)
          .map((c) => [c.symbol, c.market_cap])
      );
      for (const coin of mergedCoins) {
        if (coin.market_cap === 0 && capMap.has(coin.symbol)) {
          coin.market_cap = capMap.get(coin.symbol)!;
        }
      }
    }

    await setMarketSnapshot(mergedCoins);

    try {
      await initDB();
      const top20 = [...binanceCoins]
        .sort((a, b) => b.volume_24h - a.volume_24h)
        .slice(0, 20);

      for (const coin of top20) {
        await sql`
          INSERT INTO price_history (symbol, price_usd, price_inr, volume)
          VALUES (${coin.symbol}, ${coin.price_usd}, ${coin.price_inr}, ${coin.volume_24h})
        `;
      }
    } catch (dbErr) {
      console.error("DB insert error (non-fatal):", dbErr);
    }

    return NextResponse.json({
      success: true,
      count: mergedCoins.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { error: "Ingest failed" },
      { status: 500 }
    );
  }
}
