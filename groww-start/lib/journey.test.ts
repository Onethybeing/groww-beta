import { describe, it, expect } from "vitest";
import { journeyStatus } from "./journey";

describe("journeyStatus", () => {
  it("locks practice and invest until lesson 1 is done", () => {
    expect(journeyStatus({ lessons: {}, sipPlan: null, milestones: {} })).toEqual({
      lessonsDone: 0, practiceUnlocked: false, investUnlocked: false, hasSip: false, shareUnlocked: false,
    });
  });
  it("unlocks after lesson 1 and share after any milestone", () => {
    const r = journeyStatus({
      lessons: { "mutual-funds-sip": { quizCorrect: true, completedAt: "2026-10-07" } },
      sipPlan: null,
      milestones: { first_lesson: "2026-10-07" },
    });
    expect(r).toMatchObject({ lessonsDone: 1, practiceUnlocked: true, investUnlocked: true, shareUnlocked: true });
  });
});
