"use client";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export default function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        placeholder="SEARCH 400+ COINS..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      {query && (
        <button
          className={styles.clear}
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
