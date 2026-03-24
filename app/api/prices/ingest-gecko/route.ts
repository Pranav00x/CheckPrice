import { NextRequest, NextResponse } from "next/server";
import { fetchTop250, fetchCoinList } from "@/lib/coingecko";
import { normalizeGeckoCoin } from "@/lib/normalize";
import { getINRRate } from "@/lib/fx";
import {
  getMarketSnapshot,
  setMarketSnapshot,
  setCoinMeta,
  CoinMeta,
} from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inrRate = await getINRRate();
    const [top250, coinList] = await Promise.all([
      fetchTop250(),
      fetchCoinList(),
    ]);

    const metaMap: Record<string, CoinMeta> = {};
    for (const coin of coinList) {
      metaMap[coin.symbol.toLowerCase()] = {
        name: coin.name,
        logo_url: "",
      };
    }
    for (const coin of top250) {
      metaMap[coin.symbol.toLowerCase()] = {
        name: coin.name,
        logo_url: coin.image ?? "",
      };
    }
    await setCoinMeta(metaMap);

    const geckoCoins = top250.map((c) => normalizeGeckoCoin(c, inrRate));
    const existing = (await getMarketSnapshot()) ?? [];

    const existingMap = new Map(existing.map((c) => [c.symbol, c]));
    let added = 0;
    let updated = 0;

    for (const gc of geckoCoins) {
      const ex = existingMap.get(gc.symbol);
      if (ex) {
        ex.market_cap = gc.market_cap;
        if (ex.source === "coingecko") {
          ex.price_usd = gc.price_usd;
          ex.price_inr = gc.price_inr;
          ex.change_24h = gc.change_24h;
          ex.volume_24h = gc.volume_24h;
          ex.updated_at = gc.updated_at;
        }
        updated++;
      } else {
        existingMap.set(gc.symbol, gc);
        added++;
      }
    }

    const merged = Array.from(existingMap.values());
    await setMarketSnapshot(merged);

    return NextResponse.json({
      success: true,
      added,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Gecko ingest error:", err);
    return NextResponse.json(
      { error: "Gecko ingest failed" },
      { status: 500 }
    );
  }
}
