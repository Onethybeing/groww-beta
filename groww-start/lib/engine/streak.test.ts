import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("is zero with no instalments", () => {
    expect(computeStreak([], "2026-10-07")).toEqual({ current: 0, longest: 0, freezesUsed: 0 });
  });
  it("counts consecutive months including the current one", () => {
    expect(computeStreak(["2026-08-07", "2026-09-07", "2026-10-07"], "2026-10-07").current).toBe(3);
  });
  it("does not break when this month's instalment is still pending", () => {
    expect(computeStreak(["2026-08-07", "2026-09-07"], "2026-10-03").current).toBe(2);
  });
  it("uses one freeze for a single missed month", () => {
    expect(computeStreak(["2026-07-07", "2026-09-07", "2026-10-07"], "2026-10-07")).toEqual({ current: 3, longest: 2, freezesUsed: 1 });
  });
  it("breaks after two missed months", () => {
    const r = computeStreak(["2026-06-07", "2026-09-07", "2026-10-07"], "2026-10-07");
    expect(r.current).toBe(2);
  });
  it("crosses year boundaries", () => {
    expect(computeStreak(["2025-12-05", "2026-01-05"], "2026-01-20").current).toBe(2);
  });
  it("reports the longest strict run", () => {
    const r = computeStreak(["2026-01-05", "2026-02-05", "2026-03-05", "2026-07-05", "2026-08-05"], "2026-08-05");
    expect(r.current).toBe(2);
    expect(r.longest).toBe(3);
  });
  it("reports no freeze used when the streak is broken", () => {
    expect(computeStreak(["2026-01-05"], "2026-10-07")).toEqual({ current: 0, longest: 1, freezesUsed: 0 });
  });
});
