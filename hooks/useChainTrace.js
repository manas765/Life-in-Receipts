"use client";

import { useMemo, useState } from "react";

/**
 * Owns the "trace this moment" drawer state: which chainId is open, and the
 * receipts that belong to it (sorted chronologically). Looks the chain up
 * against the FULL receipt list, not whatever is currently filtered, so
 * tracing a moment always shows every linked receipt regardless of the
 * active type/search filters.
 */
export function useChainTrace(receipts) {
  const [openChainId, setOpenChainId] = useState(null);

  const chainReceipts = useMemo(() => {
    if (!openChainId) return [];
    return receipts
      .filter((r) => r.chainId === openChainId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [openChainId, receipts]);

  return { openChainId, openChain: setOpenChainId, closeChain: () => setOpenChainId(null), chainReceipts };
}
