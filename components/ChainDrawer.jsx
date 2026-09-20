"use client";

import { useEffect } from "react";
import PropTypes from "prop-types";
import TypeIcon from "./TypeIcon";
import { typeMeta, formatDateTime } from "../lib/receiptTypes";
import { receiptShape } from "../lib/propTypes";
import styles from "./ChainDrawer.module.css";

export default function ChainDrawer({ receipts, onClose }) {
  const isOpen = receipts.length > 0;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const first = receipts[0];
  const dateLabel = formatDateTime(first.date);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.panel} role="dialog" aria-label="Connected moment">
        <div className={styles.header}>
          <div>
            <h3 className={styles.heading}>A connected moment</h3>
            <p className={styles.subheading}>
              {receipts.length} linked receipts, starting around {dateLabel}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            {"\u00d7"}
          </button>
        </div>
        <div className={styles.body}>
          <ol className={styles.thread}>
            {receipts.map((r) => {
              const meta = typeMeta(r.type);
              return (
                <li key={r.id} className={styles.item}>
                  <span className={styles.dot} style={{ background: meta.color }} />
                  <div className={styles.itemHead}>
                    <TypeIcon type={r.type} size={12} color={meta.color} />
                    <span className={styles.itemType} style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className={styles.itemDate}>{formatDateTime(r.date)}</span>
                  </div>
                  <p className={styles.itemTitle}>{r.title}</p>
                  <p className={styles.itemSubtitle}>{r.subtitle}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </>
  );
}

ChainDrawer.propTypes = {
  receipts: PropTypes.arrayOf(receiptShape).isRequired,
  onClose: PropTypes.func.isRequired,
};
