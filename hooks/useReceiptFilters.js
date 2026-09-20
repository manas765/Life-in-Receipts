"use client";

import { useMemo, useState } from "react";
import { RECEIPT_TYPES } from "../lib/receiptTypes";

const ALL_TYPES = Object.keys(RECEIPT_TYPES);

export function matchesQuery(receipt, query) {
  if (!query) return true;
  const haystack = `${receipt.title} ${receipt.subtitle} ${receipt.detail || ""} ${receipt.tag || ""}`
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/**
 * Owns the "which receipt types are visible" and "what's the search text"
 * state, plus the predicate used to test a single receipt against both.
 * Kept separate from Experience so the filtering rules can be unit tested
 * and reused without dragging in the rest of the page's state.
 */
export function useReceiptFilters() {
  const [activeTypes, setActiveTypes] = useState(() => new Set(ALL_TYPES));
  const [query, setQuery] = useState("");

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

  const isVisible = useMemo(() => {
    return (receipt) => activeTypes.has(receipt.type) && matchesQuery(receipt, query);
  }, [activeTypes, query]);

  return { activeTypes, query, setQuery, toggleType, resetTypes, isVisible };
}
