import { describe, it, expect } from "vitest";
import { formatINR, formatPct, formatDate, ordinal } from "./format";

describe("format", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatINR(1234567.8)).toBe("₹12,34,568");
    expect(formatINR(99.5, 2)).toBe("₹99.50");
  });
  it("formats signed percentages", () => {
    expect(formatPct(12.345)).toBe("+12.3%");
    expect(formatPct(-4)).toBe("-4.0%");
    expect(formatPct(0)).toBe("0.0%");
  });
  it("formats dates", () => {
    expect(formatDate("2026-10-07")).toBe("7 Oct 2026");
  });
  it("formats ordinals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 25].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "25th"]);
  });
});
