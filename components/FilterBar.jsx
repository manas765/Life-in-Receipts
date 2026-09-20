"use client";

import TypeIcon from "./TypeIcon";
import { RECEIPT_TYPES } from "../lib/receiptTypes";
import styles from "./FilterBar.module.css";

const TYPE_ENTRIES = Object.entries(RECEIPT_TYPES);

export default function FilterBar({ query, onQueryChange, activeTypes, onToggleType, onReset }) {
  const allActive = activeTypes.size === TYPE_ENTRIES.length;

  return (
    <div className={styles.bar}>
      <div className="container">
        <div className={styles.row}>
          <input
            className={styles.search}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search a track, a place, a note..."
            aria-label="Search receipts"
          />
          <div className={styles.chips} role="group" aria-label="Filter by receipt type">
            {TYPE_ENTRIES.map(([type, meta]) => {
              const active = activeTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onToggleType(type)}
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  style={active ? { borderColor: meta.color } : undefined}
                  aria-pressed={active}
                >
                  <TypeIcon type={type} size={13} color={active ? meta.color : "currentColor"} />
                  {meta.label}
                </button>
              );
            })}
          </div>
          {!allActive && (
            <button type="button" className={styles.reset} onClick={onReset}>
              Show all types
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
