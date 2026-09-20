import { matchesQuery } from "../useReceiptFilters";

const receipt = {
  title: "Hey Jude",
  subtitle: "The Beatles",
  detail: "Past Masters",
  tag: "on repeat",
};

describe("matchesQuery", () => {
  test("matches with no query at all", () => {
    expect(matchesQuery(receipt, "")).toBe(true);
  });

  test("matches on title, case-insensitively", () => {
    expect(matchesQuery(receipt, "hey jude")).toBe(true);
  });

  test("matches on subtitle", () => {
    expect(matchesQuery(receipt, "beatles")).toBe(true);
  });

  test("matches on detail and tag too", () => {
    expect(matchesQuery(receipt, "past masters")).toBe(true);
    expect(matchesQuery(receipt, "on repeat")).toBe(true);
  });

  test("does not match unrelated text", () => {
    expect(matchesQuery(receipt, "radiohead")).toBe(false);
  });

  test("tolerates a receipt with no detail or tag", () => {
    const sparse = { title: "Purchase", subtitle: "Food" };
    expect(matchesQuery(sparse, "food")).toBe(true);
    expect(matchesQuery(sparse, "nothing")).toBe(false);
  });
});
