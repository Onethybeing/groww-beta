import { describe, it, expect } from "vitest";
import { trailingReturn, rangeOver } from "./returns";

const pts = [
  { date: "2021-10-01", close: 100 },
  { date: "2023-10-01", close: 121 },
  { date: "2025-10-01", close: 150 },
  { date: "2026-10-01", close: 135 },
];

describe("trailingReturn", () => {
  it("gives absolute % for 1 year", () => {
    expect(trailingReturn(pts, 1)).toBe(-10);
  });
  it("gives annualised % (CAGR) beyond 1 year", () => {
    expect(trailingReturn(pts, 5)).toBe(6.19); // 1.35^(1/5)-1
  });
  it("returns null when history is shorter than the period", () => {
    expect(trailingReturn(pts.slice(2), 5)).toBeNull();
  });
});

describe("rangeOver", () => {
  it("finds low and high over the last N days", () => {
    expect(rangeOver(pts, 400)).toEqual({ low: 135, high: 150 });
  });
});
