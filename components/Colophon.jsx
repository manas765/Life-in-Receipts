import PropTypes from "prop-types";
import styles from "./Colophon.module.css";

export default function Colophon({ stats }) {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <h3 className={styles.heading}>How this was assembled</h3>
            <p className={styles.text}>
              Every purchase and every track above is real: a decade of streaming history and
              four years of daily spending, read closely for the days that carried more weight
              than others.
            </p>
            <p className={styles.text}>
              A handful of categories — photos, messages, searches, notes — don&rsquo;t exist in
              either dataset, so they&rsquo;re reconstructed: anchored to a real transaction&rsquo;s date and
              written to plausibly sit beside it. Cards marked &ldquo;reconstructed&rdquo; are these. Nothing
              here claims to be a real photo or a real message; they&rsquo;re a guess at the shape of a
              day the data only half-records.
            </p>
            <p className={styles.text}>
              {stats.chains} moments turned out to have more than one receipt attached to them —
              click &ldquo;Trace this moment&rdquo; on any card to follow the thread.
            </p>
          </div>
          <ul className={styles.sources}>
            <li className={styles.source}>
              <span className={styles.sourceName}>Spotify listening history</span>
              ~150,000 streamed tracks, 2013 to 2024. Kaggle dataset.
            </li>
            <li className={styles.source}>
              <span className={styles.sourceName}>Daily household transactions</span>
              ~2,400 categorized personal expenses, 2015 to 2018. Kaggle dataset.
            </li>
            <li className={styles.source}>
              <span className={styles.sourceName}>India transact multi-facet 2024</span>
              Travel and entertainment spending across Indian cities, 2023. Kaggle dataset.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

Colophon.propTypes = {
  stats: PropTypes.shape({
    chains: PropTypes.number.isRequired,
  }).isRequired,
};
