import { describe, it, expect } from "vitest";
import { usePrefs } from "./prefs";

describe("usePrefs", () => {
  it("defaults to system theme, English, and a non-empty anon id", () => {
    const s = usePrefs.getState();
    expect(s.theme).toBe("system");
    expect(s.lang).toBe("en");
    expect(s.anonId.length).toBeGreaterThan(8);
  });
  it("sets theme and language", () => {
    usePrefs.getState().setTheme("dark");
    usePrefs.getState().setLang("hi");
    expect(usePrefs.getState()).toMatchObject({ theme: "dark", lang: "hi" });
  });
});
