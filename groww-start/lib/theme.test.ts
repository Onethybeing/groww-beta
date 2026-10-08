import { describe, it, expect } from "vitest";
import { resolveTheme, THEME_BOOT_SCRIPT } from "./theme";

describe("resolveTheme", () => {
  it("follows the system when pref is system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("explicit choice wins", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("boot script reads the persisted grow-ui store and never throws", () => {
    expect(THEME_BOOT_SCRIPT).toContain("grow-ui");
    expect(THEME_BOOT_SCRIPT).toContain("try");
  });
});
