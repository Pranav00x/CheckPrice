"use client";

import { List } from "react-window";
import { CoinData } from "@/lib/kv";
import styles from "./MarketList.module.css";
import { CSSProperties, ReactElement } from "react";

interface MarketListProps {
  coins: CoinData[];
  selectedSymbol: string | null;
  onSelectCoin: (coin: CoinData) => void;
}

interface RowProps {
  coins: CoinData[];
  selectedSymbol: string | null;
  onSelectCoin: (coin: CoinData) => void;
}

function formatINR(n: number): string {
  if (n < 1) return "₹" + n.toFixed(6);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function formatVolume(v: number): string {
  if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + " Cr";
  if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2) + " L";
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function Row({
  index,
  style,
  coins,
  selectedSymbol,
  onSelectCoin,
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: CSSProperties;
} & RowProps): ReactElement | null {
  const coin = coins[index];
  if (!coin) return null;
  const isSelected = coin.symbol === selectedSymbol;
  const changeStr =
    coin.change_24h >= 0
      ? `+${coin.change_24h.toFixed(2)}%`
      : `−${Math.abs(coin.change_24h).toFixed(2)}%`;

  return (
    <div
      style={style}
      className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
      onClick={() => onSelectCoin(coin)}
    >
      <div className={styles.colSymbol}>{coin.symbol}</div>
      <div className={styles.colName}>{coin.name}</div>
      <div className={styles.colPrice}>{formatINR(coin.price_inr)}</div>
      <div
        className={
          coin.change_24h >= 0 ? styles.changeUp : styles.changeDown
        }
      >
        {changeStr}
      </div>
      <div className={styles.colVolume}>{formatVolume(coin.volume_24h)}</div>
    </div>
  );
}

export default function MarketList({
  coins,
  selectedSymbol,
  onSelectCoin,
}: MarketListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.colSymbol}>SYMBOL</div>
        <div className={styles.colName}>NAME</div>
        <div className={styles.colPrice}>PRICE INR</div>
        <div className={styles.colChange}>24H</div>
        <div className={styles.colVolume}>VOLUME</div>
      </div>
      <div className={styles.listWrap}>
        <List
          rowComponent={Row}
          rowCount={coins.length}
          rowHeight={36}
          rowProps={{ coins, selectedSymbol, onSelectCoin }}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}
