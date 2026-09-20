import PropTypes from "prop-types";
import styles from "./Sparkline.module.css";

// Sums each receipt's amount into its month bucket (0-11) so the bar heights
// come straight from the real transaction data for that chapter.
function monthlyTotals(receipts) {
  const totals = new Array(12).fill(0);
  for (const r of receipts) {
    if (!r.amount) continue;
    const month = new Date(r.date).getMonth();
    totals[month] += r.amount;
  }
  return totals;
}

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function Sparkline({ receipts, color }) {
  const totals = monthlyTotals(receipts);
  const max = Math.max(...totals, 1);

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 240 48" preserveAspectRatio="none" className={styles.svg}>
        {totals.map((value, i) => {
          const barWidth = 240 / 12 - 3;
          const x = i * (240 / 12) + 1.5;
          const height = (value / max) * 42;
          return (
            <rect
              key={i}
              x={x}
              y={46 - height}
              width={barWidth}
              height={Math.max(height, 1)}
              fill={color}
              opacity={value === 0 ? 0.15 : 0.85}
              rx="1"
            />
          );
        })}
      </svg>
      <div className={styles.labels}>
        {MONTH_LABELS.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}

Sparkline.propTypes = {
  receipts: PropTypes.arrayOf(
    PropTypes.shape({ date: PropTypes.string.isRequired, amount: PropTypes.number })
  ).isRequired,
  color: PropTypes.string.isRequired,
};
