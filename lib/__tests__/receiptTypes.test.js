import { typeMeta, formatDate, formatDateTime, formatAmount, RECEIPT_TYPES } from "../receiptTypes";

describe("typeMeta", () => {
  test("returns the configured meta for a known type", () => {
    expect(typeMeta("music")).toEqual(RECEIPT_TYPES.music);
  });

  test("falls back to a neutral default for an unknown type", () => {
    const meta = typeMeta("does-not-exist");
    expect(meta.label).toBe("does-not-exist");
    expect(meta.color).toBe("#57544C");
  });
});

describe("formatAmount", () => {
  test("formats INR with a rupee sign and Indian digit grouping", () => {
    expect(formatAmount(62960, "INR")).toBe("\u20b962,960");
  });

  test("falls back to the currency code for non-INR amounts", () => {
    expect(formatAmount(1000, "USD")).toBe("USD 1,000");
  });

  test("returns an empty string when amount is missing", () => {
    expect(formatAmount(undefined, "INR")).toBe("");
    expect(formatAmount(null, "INR")).toBe("");
  });
});

describe("formatDate / formatDateTime", () => {
  const iso = "2017-08-06T00:00:00.000Z";

  test("formatDate produces a short day/month/year label", () => {
    expect(formatDate(iso)).toMatch(/2017/);
  });

  test("formatDateTime includes a time component", () => {
    expect(formatDateTime(iso)).toMatch(/2017/);
    expect(formatDateTime(iso)).toMatch(/:/);
  });
});
