// One small, consistent "stamp ink" palette — all muted, all in the same
// desaturated family, so nine categories read as one coherent ledger rather
// than a rainbow of SaaS tags. Color is functional here: it's the fastest way
// to tell receipt types apart at a glance across a long scroll of cards.
export const RECEIPT_TYPES = {
  music: { label: "Music", color: "#3E5C77" },
  purchase: { label: "Purchase", color: "#57544C" },
  movie: { label: "Watched", color: "#A6402F" },
  place: { label: "Place", color: "#B98A2E" },
  photo: { label: "Photo", color: "#4F6B4A" },
  message: { label: "Message", color: "#6B4A63" },
  search: { label: "Search", color: "#3E7A72" },
  note: { label: "Note", color: "#8A5A2E" },
  event: { label: "Event", color: "#5A4A77" },
};

export function typeMeta(type) {
  return RECEIPT_TYPES[type] || { label: type, color: "#57544C" };
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function formatAmount(amount, currency) {
  if (amount === undefined || amount === null) return "";
  return `${currency === "INR" ? "₹" : currency + " "}${amount.toLocaleString("en-IN")}`;
}
