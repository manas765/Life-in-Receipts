"use client";

import { useMemo } from "react";

/**
 * Derives the hero/colophon headline numbers (total receipts, listening
 * hours, connected-moment count, year span) from the full dataset. Kept
 * separate from filter state deliberately: these numbers describe the whole
 * archive and should never change just because someone typed in the search
 * box or toggled a type chip off.
 */
export function useGlobalStats(receipts, chapters) {
  return useMemo(() => {
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
}
