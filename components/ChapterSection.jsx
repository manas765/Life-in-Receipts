import ReceiptCard from "./ReceiptCard";
import Sparkline from "./Sparkline";
import styles from "./ChapterSection.module.css";

export default function ChapterSection({ chapter, allReceipts, visibleReceipts, onTrace }) {
  const { stats } = chapter;
  const sorted = [...visibleReceipts].sort((a, b) => new Date(a.date) - new Date(b.date));

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

        <div className={styles.grid}>
          {sorted.length === 0 && (
            <p className={styles.empty}>No receipts match your filters in this chapter.</p>
          )}
          {sorted.map((r) => (
            <ReceiptCard key={r.id} receipt={r} onTrace={onTrace} />
          ))}
        </div>
      </div>
    </section>
  );
}
