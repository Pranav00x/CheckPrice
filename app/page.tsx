"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { CoinData } from "@/lib/kv";
import Ticker from "@/components/Ticker";
import SearchBar from "@/components/SearchBar";
import MarketList from "@/components/MarketList";
import CoinDetail from "@/components/CoinDetail";

type SortKey = "volume" | "change" | "price";
type SortOrder = "asc" | "desc";

export default function Home() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("volume");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch("/api/prices/market");
      if (!res.ok) return;
      const data: CoinData[] = await res.json();

      setCoins((prev) => {
        if (prev.length === 0) return data;
        const prevMap = new Map(prev.map((c) => [c.symbol, c.updated_at]));
        const hasChanges = data.some(
          (c) => prevMap.get(c.symbol) !== c.updated_at
        );
        return hasChanges ? data : prev;
      });

      if (data.length > 0) {
        const latest = data.reduce((a, b) =>
          a.updated_at > b.updated_at ? a : b
        );
        const d = new Date(latest.updated_at);
        setLastUpdated(
          d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  const filtered = useMemo(() => {
    let list = coins;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
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

    return list;
  }, [coins, query, sort, order]);

  const cycleSort = () => {
    if (sort === "volume") {
      setSort("change");
    } else if (sort === "change") {
      setSort("price");
    } else {
      setSort("volume");
    }
  };

  const toggleOrder = () => {
    setOrder((o) => (o === "desc" ? "asc" : "desc"));
  };

  const sortLabel =
    sort === "volume" ? "VOL" : sort === "change" ? "24H" : "PRICE";

  return (
    <div className="page">
      <header className="topBar">
        <div className="brand">
          <span className="brandName">TRANZO</span>
          <span className="brandSep">/</span>
          <span className="brandSub">MARKET</span>
        </div>
        <div className="updated">
          {lastUpdated ? `UPDATED ${lastUpdated}` : "———"}
        </div>
      </header>

      <Ticker coins={coins} />

      <div className="controls">
        <div className="searchWrap">
          <SearchBar query={query} onQueryChange={setQuery} />
        </div>
        <div className="sortBtns">
          <button className="sortBtn" onClick={cycleSort}>
            {sortLabel}
          </button>
          <button className="sortBtn" onClick={toggleOrder}>
            {order === "desc" ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">———</div>
      ) : (
        <MarketList
          coins={filtered}
          selectedSymbol={selectedCoin?.symbol ?? null}
          onSelectCoin={setSelectedCoin}
        />
      )}

      {selectedCoin && (
        <CoinDetail
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}
