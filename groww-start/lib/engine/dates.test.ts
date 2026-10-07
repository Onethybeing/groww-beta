import { describe, it, expect } from "vitest";
import { toISTDate, addDays, monthKey, prevMonthKey, nextMonthKey, daysInMonth, dateInMonth, addMonths, daysBetween } from "./dates";

describe("dates", () => {
  it("converts to IST calendar date", () => {
    expect(toISTDate(new Date("2026-10-06T19:00:00Z"))).toBe("2026-10-07");
    expect(toISTDate(new Date("2026-10-06T18:00:00Z"))).toBe("2026-10-06");
  });
  it("adds days across month ends", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("handles month keys across years", () => {
    expect(monthKey("2026-10-07")).toBe("2026-10");
    expect(prevMonthKey("2026-01")).toBe("2025-12");
    expect(nextMonthKey("2025-12")).toBe("2026-01");
  });
  it("clamps day to month length", () => {
    expect(daysInMonth("2024-02")).toBe(29);
    expect(dateInMonth("2026-02", 31)).toBe("2026-02-28");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-15", 2)).toBe("2027-01-15");
  });
  it("counts days between dates", () => {
    expect(daysBetween("2026-10-07", "2026-11-07")).toBe(31);
  });
});
