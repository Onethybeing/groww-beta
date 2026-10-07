import { describe, it, expect } from "vitest";
import { personaFor, PRESET_ANSWERS, type Answers } from "./persona";

const a = (p: Partial<Answers>): Answers => ({ goal: "wealth", experience: "mf", budget: "500-2k", reaction: "wait", horizon: "3plus", ...p });

describe("personaFor", () => {
  it("routes short horizons and emergency goals to Goal Saver with liquid category", () => {
    expect(personaFor(a({ horizon: "lt1" }))).toMatchObject({ id: "goal-saver", suggestedCategory: "liquid" });
    expect(personaFor(a({ goal: "emergency" })).id).toBe("goal-saver");
  });
  it("routes learners, first-timers and panic sellers to Curious Explorer", () => {
    expect(personaFor(a({ goal: "learning" })).id).toBe("curious-explorer");
    expect(personaFor(a({ experience: "never" })).id).toBe("curious-explorer");
    expect(personaFor(a({ reaction: "sell" })).id).toBe("curious-explorer");
  });
  it("defaults to Steady Starter with index category", () => {
    expect(personaFor(a({}))).toMatchObject({ id: "steady-starter", suggestedCategory: "index" });
  });
  it("maps budget to suggested amount", () => {
    expect(personaFor(a({ budget: "100-500" })).suggestedAmount).toBe(100);
    expect(personaFor(a({ budget: "500-2k" })).suggestedAmount).toBe(250);
    expect(personaFor(a({ budget: "5k+" })).suggestedAmount).toBe(500);
  });
  it("presets resolve to their own persona", () => {
    for (const [id, answers] of Object.entries(PRESET_ANSWERS)) expect(personaFor(answers).id).toBe(id);
  });
  it("is deterministic", () => {
    expect(personaFor(a({}))).toEqual(personaFor(a({})));
  });
});
