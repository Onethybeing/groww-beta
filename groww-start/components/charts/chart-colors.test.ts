import { describe, it, expect } from "vitest";
import { withAlpha } from "./chart-colors";
describe("withAlpha", () => {
  it("converts hex to rgba", () => {
    expect(withAlpha("#0b7a55", 0.2)).toBe("rgba(11,122,85,0.2)");
    expect(withAlpha("#fff", 0)).toBe("rgba(255,255,255,0)");
  });
});
