"use client";

import styles from "./RangeSelector.module.css";

interface RangeSelectorProps {
  active: string;
  onChange: (range: string) => void;
}

const RANGES = ["1D", "7D", "30D"];

export default function RangeSelector({ active, onChange }: RangeSelectorProps) {
  return (
    <div className={styles.wrapper}>
      {RANGES.map((r) => (
        <button
          key={r}
          className={
            active === r.toLowerCase() ? styles.btnActive : styles.btn
          }
          onClick={() => onChange(r.toLowerCase())}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
