import { NextRequest, NextResponse } from "next/server";
import { getMarketSnapshot } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
    if (!q) {
      return NextResponse.json([]);
    }

    const snapshot = await getMarketSnapshot();
    if (!snapshot) {
      return NextResponse.json([]);
    }

    const matches = snapshot
      .filter(
        (c) =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      )
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 50);

    return NextResponse.json(matches);
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
