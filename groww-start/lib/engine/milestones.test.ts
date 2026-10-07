import { describe, it, expect } from "vitest";
import { evaluateMilestones, type MilestoneInput } from "./milestones";

const zero: MilestoneInput = { lessonsCompleted: 0, timeMachineRuns: 0, mockBuys: 0, instalments: 0, streak: 0 };

describe("evaluateMilestones", () => {
  it("awards nothing at zero", () => {
    expect(evaluateMilestones(zero, {}, "2026-10-07")).toEqual({});
  });
  it("awards each milestone at its threshold", () => {
    const r = evaluateMilestones({ lessonsCompleted: 3, timeMachineRuns: 1, mockBuys: 1, instalments: 1, streak: 3 }, {}, "2026-10-07");
    expect(Object.keys(r).sort()).toEqual(["first_lesson", "first_mock_buy", "first_sip", "first_time_machine", "streak_3", "three_lessons"]);
    expect(r.first_sip).toBe("2026-10-07");
  });
  it("is idempotent: never re-awards", () => {
    const r = evaluateMilestones({ ...zero, lessonsCompleted: 1 }, { first_lesson: "2026-10-01" }, "2026-10-07");
    expect(r).toEqual({});
  });
});
