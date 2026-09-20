import styles from "./Hero.module.css";

export default function Hero({ stats }) {
  return (
    <header className={styles.hero}>
      <div className="container">
        <p className={styles.eyebrow}>a digital archive, {stats.span}</p>
        <h1 className={styles.title}>
          Your life, <em>in receipts</em>
        </h1>
        <p className={styles.lede}>
          {stats.total.toLocaleString("en-IN")} small records — songs played, money spent,
          places visited, notes left for no one — pulled from real listening history and real
          spending, then read closely enough to find where they touch.
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total.toLocaleString("en-IN")}</span>
            <span className={styles.statLabel}>receipts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.hours.toLocaleString("en-IN")}</span>
            <span className={styles.statLabel}>hours listened</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.chains}</span>
            <span className={styles.statLabel}>connected moments found</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.span}</span>
            <span className={styles.statLabel}>years covered</span>
          </div>
        </div>
      </div>
    </header>
  );
}
