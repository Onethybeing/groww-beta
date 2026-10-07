import { describe, it, expect } from "vitest";
import { safeDecode } from "./safe-decode";

describe("safeDecode", () => {
  it("decodes valid escapes and leaves malformed input alone", () => {
    expect(safeDecode("RELIANCE.NS")).toBe("RELIANCE.NS");
    expect(safeDecode("%5ENSEI")).toBe("^NSEI");
    expect(safeDecode("%")).toBe("%");
  });
});
