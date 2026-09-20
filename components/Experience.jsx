"use client";

import { useMemo, useState } from "react";
import Hero from "./Hero";
import ChapterNav from "./ChapterNav";
import FilterBar from "./FilterBar";
import ChapterSection from "./ChapterSection";
import ChainDrawer from "./ChainDrawer";
import Colophon from "./Colophon";
import { RECEIPT_TYPES } from "../lib/receiptTypes";

const ALL_TYPES = Object.keys(RECEIPT_TYPES);

function matchesQuery(receipt, query) {
  if (!query) return true;
  const haystack = `${receipt.title} ${receipt.subtitle} ${receipt.detail || ""} ${receipt.tag || ""}`
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function Experience({ receipts, chapters }) {
  const [activeTypes, setActiveTypes] = useState(() => new Set(ALL_TYPES));
  const [query, setQuery] = useState("");
  const [openChainId, setOpenChainId] = useState(null);

  function toggleType(type) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function resetTypes() {
    setActiveTypes(new Set(ALL_TYPES));
  }

  const receiptsByChapter = useMemo(() => {
    const map = new Map();
    for (const chapter of chapters) map.set(chapter.id, []);
    for (const r of receipts) {
      if (map.has(r.chapter)) map.get(r.chapter).push(r);
    }
    return map;
  }, [receipts, chapters]);

  const globalStats = useMemo(() => {
    const chainCounts = new Map();
    for (const r of receipts) {
      if (!r.chainId) continue;
      chainCounts.set(r.chainId, (chainCounts.get(r.chainId) || 0) + 1);
    }
    const linkedChains = [...chainCounts.values()].filter((n) => n >= 2).length;
    const totalHours = chapters.reduce((sum, c) => sum + (c.stats.listeningHours || 0), 0);
    const years = chapters.map((c) => c.years);
    return {
      total: receipts.length,
      chains: linkedChains,
      hours: Math.round(totalHours),
      span: `${years[0]}\u2013${years[years.length - 1]}`,
    };
  }, [receipts, chapters]);

  const chainReceipts = useMemo(() => {
    if (!openChainId) return [];
    return receipts
      .filter((r) => r.chainId === openChainId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [openChainId, receipts]);

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
        {chapters.map((chapter) => {
          const chapterReceipts = receiptsByChapter.get(chapter.id) || [];
          const filtered = chapterReceipts.filter(
            (r) => activeTypes.has(r.type) && matchesQuery(r, query)
          );
          return (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              allReceipts={chapterReceipts}
              visibleReceipts={filtered}
              onTrace={setOpenChainId}
            />
          );
        })}
      </main>

      <Colophon stats={globalStats} />

      <ChainDrawer
        receipts={chainReceipts}
        onClose={() => setOpenChainId(null)}
      />
    </>
  );
}
