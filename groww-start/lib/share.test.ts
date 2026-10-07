import { describe, it, expect } from "vitest";
import { shareHref, parseShareParams, cardLines } from "./share";

describe("share", () => {
  it("builds an href with only habit stats", () => {
    expect(shareHref("streak_3", { streak: 3, lessons: 2, persona: "steady-starter" }))
      .toBe("/share/streak_3?streak=3&lessons=2&persona=steady-starter");
  });
  it("sanitises params", () => {
    expect(parseShareParams({ streak: "-5", lessons: "abc", persona: "hacker" }, "nope"))
      .toEqual({ milestone: null, streak: 0, lessons: 0, persona: undefined });
    expect(parseShareParams({ streak: "99999" }, "first_sip").streak).toBe(999);
  });
  it("never puts rupee amounts on the card", () => {
    const lines = cardLines({ milestone: "first_sip", streak: 3, lessons: 3, persona: "steady-starter" });
    expect(JSON.stringify(lines)).not.toMatch(/₹|%|\bRs\b/);
    expect(lines.headline).toBe("First investment");
    expect(lines.chips).toEqual(["3-month SIP streak", "3 lessons", "Steady Starter"]);
  });
  it("has a generic card for unknown milestones", () => {
    expect(cardLines({ milestone: null, streak: 0, lessons: 0 }).headline).toBe("Started my investing journey");
  });
});
