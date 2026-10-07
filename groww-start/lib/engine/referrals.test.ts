import { describe, it, expect } from "vitest";
import { referralCode, isValidCode, referralFreezes, MAX_REFERRAL_FREEZES } from "./referrals";

describe("referrals", () => {
  it("derives a stable, readable code from the user id", () => {
    const c = referralCode("3f9a2c1e-0000-4000-8000-000000000000");
    expect(c).toMatch(/^GROW-[A-HJ-NP-Z2-9]{4}$/);
    expect(referralCode("3f9a2c1e-0000-4000-8000-000000000000")).toBe(c);
    expect(referralCode("another-user")).not.toBe(c);
  });
  it("validates codes (case-insensitive, no ambiguous characters)", () => {
    expect(isValidCode("GROW-AB2C")).toBe(true);
    expect(isValidCode("grow-ab2c")).toBe(true);
    expect(isValidCode("GROW-AB0C")).toBe(false);
    expect(isValidCode("GROWW-AB2C")).toBe(false);
  });
  it("rewards a streak freeze per friend plus one for joining via invite, capped", () => {
    expect(referralFreezes(0, false)).toBe(0);
    expect(referralFreezes(1, false)).toBe(1);
    expect(referralFreezes(1, true)).toBe(2);
    expect(referralFreezes(10, true)).toBe(MAX_REFERRAL_FREEZES);
  });
});
