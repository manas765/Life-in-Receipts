"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ReceiptCard from "./ReceiptCard";
import Sparkline from "./Sparkline";
import styles from "./ChapterSection.module.css";
import { receiptShape, chapterShape } from "../lib/propTypes";

const PAGE_SIZE = 60;

export default function ChapterSection({ chapter, allReceipts, visibleReceipts, onTrace }) {
  const { stats } = chapter;
  const sorted = [...visibleReceipts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Large chapters (2017 alone has 200+ receipts) shouldn't render every
  // card at once — that's wasted DOM and layout cost for anyone who never
  // scrolls that far. Reset the page size whenever the filtered set changes
  // shape, so switching filters doesn't leave the list stuck mid-page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [chapter.id, sorted.length]);

  const page = sorted.slice(0, visibleCount);
  const remaining = sorted.length - page.length;

  return (
    <section id={`chapter-${chapter.id}`} className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.year}>{chapter.years}</p>
          <h2 className={styles.label}>{chapter.label}</h2>
          <p className={styles.blurb}>{chapter.blurb}</p>

          <Sparkline receipts={allReceipts} color="var(--carbon)" />

          <div className={styles.pills}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Total spent</span>
              <span className={styles.pillValue}>
                {"\u20b9"}{stats.totalSpent.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Top category</span>
              <span className={styles.pillValue}>{stats.topCategory}</span>
            </div>
            {stats.topArtist !== "\u2014" && (
              <div className={styles.pill}>
                <span className={styles.pillLabel}>Most played</span>
                <span className={styles.pillValue}>{stats.topArtist}</span>
              </div>
            )}
            {stats.listeningHours > 0 && (
              <div className={styles.pill}>
                <span className={styles.pillLabel}>Night owl</span>
                <span className={styles.pillValue}>{stats.nightOwlPct}% after midnight</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className={styles.grid}>
            {sorted.length === 0 && (
              <p className={styles.empty}>No receipts match your filters in this chapter.</p>
            )}
            {page.map((r) => (
              <ReceiptCard key={r.id} receipt={r} onTrace={onTrace} />
            ))}
          </div>
          {remaining > 0 && (
            <button
              type="button"
              className={styles.more}
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              Show {Math.min(remaining, PAGE_SIZE)} more
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

ChapterSection.propTypes = {
  chapter: chapterShape.isRequired,
  allReceipts: PropTypes.arrayOf(receiptShape).isRequired,
  visibleReceipts: PropTypes.arrayOf(receiptShape).isRequired,
  onTrace: PropTypes.func.isRequired,
};
