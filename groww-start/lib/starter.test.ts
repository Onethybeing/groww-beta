import { describe, it, expect } from "vitest";
import { starterFund, starterSipHref } from "./starter";
import { MIN_SIP } from "@/lib/engine/instalments";

const base = { experience: "never", budget: "100-500", reaction: "wait" } as const;

describe("starter fund", () => {
  it("defaults to the index fund", () => {
    expect(starterFund(null).symbol).toBe("MF120716");
  });
  it("follows the persona: short horizon or emergency → liquid fund", () => {
    expect(starterFund({ ...base, goal: "emergency", horizon: "3plus" }).category).toBe("liquid");
    expect(starterFund({ ...base, goal: "wealth", horizon: "lt1" }).category).toBe("liquid");
    expect(starterFund({ ...base, goal: "wealth", horizon: "3plus" }).category).toBe("index");
  });
  it("builds the SIP route", () => {
    expect(starterSipHref(null)).toBe("/funds/MF120716/sip");
  });
  it("SIP minimum is ₹100", () => {
    expect(MIN_SIP).toBe(100);
  });
});
