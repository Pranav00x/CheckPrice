"use client";

import { CoinData } from "@/lib/kv";
import styles from "./Ticker.module.css";

interface TickerProps {
  coins: CoinData[];
}

function formatINR(n: number): string {
  if (n < 1) return "₹" + n.toFixed(6);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function Ticker({ coins }: TickerProps) {
  const top10 = coins
    .slice()
    .sort((a, b) => b.volume_24h - a.volume_24h)
    .slice(0, 10);

  if (top10.length === 0) return null;

  const items = top10.map((c) => {
    const changeStr =
      c.change_24h >= 0
        ? `+${c.change_24h.toFixed(2)}%`
        : `−${Math.abs(c.change_24h).toFixed(2)}%`;
    return (
      <span key={c.symbol} className={styles.item}>
        <span className={styles.symbol}>{c.symbol}</span>{" "}
        <span className={styles.price}>{formatINR(c.price_inr)}</span>{" "}
        <span
          className={
            c.change_24h >= 0 ? styles.changeUp : styles.changeDown
          }
        >
          {changeStr}
        </span>
        <span className={styles.dot}> · </span>
      </span>
    );
  });

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        <div className={styles.content}>
          {items}
          {items}
        </div>
      </div>
    </div>
  );
}
