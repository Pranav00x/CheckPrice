import { NextRequest, NextResponse } from "next/server";
import { getMarketSnapshot, setMarketSnapshot } from "@/lib/kv";
import { fetchAllUSDTPairs } from "@/lib/binance";
import { normalizeBinanceTicker } from "@/lib/normalize";
import { getINRRate } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let snapshot = await getMarketSnapshot();

    if (!snapshot || snapshot.length === 0) {
      const inrRate = await getINRRate();
      const tickers = await fetchAllUSDTPairs();
      snapshot = tickers.map((t) =>
        normalizeBinanceTicker(t, inrRate, null)
      );
      await setMarketSnapshot(snapshot);
    }

    const { searchParams } = req.nextUrl;
    const sort = searchParams.get("sort") ?? "volume";
    const order = searchParams.get("order") ?? "desc";

    snapshot.sort((a, b) => {
      let va: number, vb: number;
      switch (sort) {
        case "price":
          va = a.price_usd;
          vb = b.price_usd;
          break;
        case "change":
          va = a.change_24h;
          vb = b.change_24h;
          break;
        default:
          va = a.volume_24h;
          vb = b.volume_24h;
      }
      return order === "asc" ? va - vb : vb - va;
    });

    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("Market API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
