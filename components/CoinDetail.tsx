"use client";

import { useEffect, useState, useCallback } from "react";
import { CoinData } from "@/lib/kv";
import Chart from "./Chart";
import RangeSelector from "./RangeSelector";
import styles from "./CoinDetail.module.css";

interface ChartPoint {
  timestamp: string;
  price_inr: number;
  price_usd: number;
  volume: number;
}

interface CoinDetailProps {
  coin: CoinData;
  onClose: () => void;
}

function formatINR(n: number): string {
  if (n < 1) return "₹" + n.toFixed(6);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function CoinDetail({ coin, onClose }: CoinDetailProps) {
  const [range, setRange] = useState("1d");
  const [history, setHistory] = useState<Record<string, ChartPoint[] | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchHistory = useCallback(
    async (r: string) => {
      const cacheKey = `${coin.symbol}:${r}`;
      if (history[cacheKey]) return;

      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/prices/history?symbol=${coin.symbol}&range=${r}`
        );
        if (!res.ok) throw new Error("fetch failed");
        const data: ChartPoint[] = await res.json();
        setHistory((prev) => ({ ...prev, [cacheKey]: data }));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [coin.symbol, history]
  );

  useEffect(() => {
    fetchHistory(range);
  }, [range, fetchHistory]);

  const cacheKey = `${coin.symbol}:${range}`;
  const chartData = history[cacheKey] ?? null;

  const changeStr =
    coin.change_24h >= 0
      ? `+${coin.change_24h.toFixed(2)}%`
      : `−${Math.abs(coin.change_24h).toFixed(2)}%`;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.symbol}>{coin.symbol}</span>
          <span className={styles.sep}>/</span>
          <span className={styles.name}>{coin.name}</span>
        </div>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.priceRow}>
        <span className={styles.priceInr}>{formatINR(coin.price_inr)}</span>
        <span
          className={
            coin.change_24h >= 0 ? styles.changeUp : styles.changeDown
          }
        >
          {changeStr}
        </span>
      </div>
      <div className={styles.priceUsd}>
        ${coin.price_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </div>
      <div className={styles.rangeRow}>
        <RangeSelector active={range} onChange={setRange} />
      </div>
      <Chart data={chartData} loading={loading} error={error} />
    </div>
  );
}
