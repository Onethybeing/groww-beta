import { describe, it, expect } from "vitest";
import { formatINR, formatPct, formatDate } from "./format";

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
});
