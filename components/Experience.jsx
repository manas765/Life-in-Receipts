"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import Hero from "./Hero";
import ChapterNav from "./ChapterNav";
import FilterBar from "./FilterBar";
import ChapterSection from "./ChapterSection";
import ChainDrawer from "./ChainDrawer";
import Colophon from "./Colophon";
import { useReceiptFilters } from "../hooks/useReceiptFilters";
import { useChainTrace } from "../hooks/useChainTrace";
import { useGlobalStats } from "../hooks/useGlobalStats";
import { receiptShape, chapterShape } from "../lib/propTypes";

/**
 * Top-level orchestration only: group receipts by chapter, wire the three
 * state hooks (filters, chain trace, global stats) together, and lay out
 * the page. All of the actual state logic lives in ./hooks — this file
 * shouldn't need to change when that logic does.
 */
export default function Experience({ receipts, chapters }) {
  const { activeTypes, query, setQuery, toggleType, resetTypes, isVisible } = useReceiptFilters();
  const { openChainId, openChain, closeChain, chainReceipts } = useChainTrace(receipts);
  const globalStats = useGlobalStats(receipts, chapters);

  const receiptsByChapter = useMemo(() => {
    const map = new Map();
    for (const chapter of chapters) map.set(chapter.id, []);
    for (const r of receipts) {
      if (map.has(r.chapter)) map.get(r.chapter).push(r);
    }
    return map;
  }, [receipts, chapters]);

  // Recomputed only when the filter/search state or the underlying data
  // actually changes, not on every render (e.g. opening the chain drawer) —
  // keeps the per-chapter card grids from re-filtering unnecessarily.
  const filteredByChapter = useMemo(() => {
    const map = new Map();
    for (const chapter of chapters) {
      const chapterReceipts = receiptsByChapter.get(chapter.id) || [];
      map.set(chapter.id, chapterReceipts.filter(isVisible));
    }
    return map;
  }, [chapters, receiptsByChapter, isVisible]);

  return (
    <>
      <Hero stats={globalStats} />
      <ChapterNav chapters={chapters} />
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        activeTypes={activeTypes}
        onToggleType={toggleType}
        onReset={resetTypes}
      />

      <main className="container">
        {chapters.map((chapter) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            allReceipts={receiptsByChapter.get(chapter.id) || []}
            visibleReceipts={filteredByChapter.get(chapter.id) || []}
            onTrace={openChain}
          />
        ))}
      </main>

      <Colophon stats={globalStats} />

      <ChainDrawer receipts={chainReceipts} onClose={closeChain} />
    </>
  );
}

Experience.propTypes = {
  receipts: PropTypes.arrayOf(receiptShape).isRequired,
  chapters: PropTypes.arrayOf(chapterShape).isRequired,
};
