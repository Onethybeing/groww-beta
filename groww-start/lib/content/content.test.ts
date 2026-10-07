import { describe, it, expect } from "vitest";
import { LESSONS, getLesson, GLOSSARY, glossaryRefs } from "./index";
import { LESSON_ICON_NAMES } from "./schema";
import { getInstrument } from "@/lib/market/instruments";

describe("content", () => {
  it("loads 3 lessons in order, each ending in a quiz", () => {
    expect(LESSONS.map((l) => l.id)).toEqual(["mutual-funds-sip", "index-funds", "ups-and-downs"]);
    for (const l of LESSONS) expect(l.cards[l.cards.length - 1].type).toBe("quiz");
  });
  it("every glossary reference exists", () => {
    for (const l of LESSONS) for (const c of l.cards) {
      const text = JSON.stringify(c);
      for (const key of glossaryRefs(text)) expect(GLOSSARY[key], `${l.id}: ${key}`).toBeDefined();
    }
  });
  it("chart cards reference curated instruments", () => {
    for (const l of LESSONS) for (const c of l.cards) if (c.type === "chart") expect(getInstrument(c.symbol)).toBeDefined();
  });
  it("text card icons are known lucide names", () => {
    for (const l of LESSONS) for (const c of l.cards) if (c.type === "text" && c.icon) expect(LESSON_ICON_NAMES).toContain(c.icon);
  });
  it("glossary entries link only to existing lessons", () => {
    for (const [key, g] of Object.entries(GLOSSARY)) if (g.lesson) expect(getLesson(g.lesson), key).toBeDefined();
  });
  it("getLesson returns undefined for unknown ids", () => {
    expect(getLesson("nope")).toBeUndefined();
  });
});
