import TypeIcon from "./TypeIcon";
import { typeMeta, formatDate, formatAmount } from "../lib/receiptTypes";
import styles from "./ReceiptCard.module.css";

export default function ReceiptCard({ receipt, onTrace }) {
  const meta = typeMeta(receipt.type);

  return (
    <article className={styles.card} style={{ borderLeftColor: meta.color }}>
      <div className={styles.head}>
        <TypeIcon type={receipt.type} size={13} color={meta.color} />
        <span className={styles.typeLabel} style={{ color: meta.color }}>
          {meta.label}
        </span>
        {receipt.synthesized && <span className={styles.synthTag}>reconstructed</span>}
      </div>

      <p className={styles.title}>{receipt.title}</p>
      <p className={styles.subtitle}>{receipt.subtitle}</p>
      {receipt.detail && <p className={styles.detail}>{receipt.detail}</p>}

      <div className={styles.footRow}>
        <span className={styles.date}>{formatDate(receipt.date)}</span>
        {receipt.amount ? (
          <span className={styles.amount}>{formatAmount(receipt.amount, receipt.currency)}</span>
        ) : null}
      </div>

      {receipt.chainId && (
        <button type="button" className={styles.traceBtn} onClick={() => onTrace(receipt.chainId)}>
          Trace this moment
        </button>
      )}
    </article>
  );
}
