"use client";

import { useEffect, useState } from "react";
import styles from "./ChapterNav.module.css";

export default function ChapterNav({ chapters }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(`chapter-${c.id}`))
      .filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id.replace("chapter-", ""));
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav className={styles.nav} aria-label="Jump to chapter">
      <div className="container">
        <div className={styles.row}>
          {chapters.map((c) => (
            <a
              key={c.id}
              href={`#chapter-${c.id}`}
              className={`${styles.tab} ${activeId === c.id ? styles.tabActive : ""}`}
            >
              <span className={styles.tabYear}>{c.years}</span>
              <span className={styles.tabLabel}>{c.label}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
