import { describe, it, expect, beforeAll } from "vitest";

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key() { return null; }
  get length() { return this.m.size; }
}
let mod: typeof import("./prefs");
beforeAll(async () => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
  mod = await import("./prefs");
});

describe("usePrefs", () => {
  it("defaults to system theme, English, and a non-empty anon id", () => {
    const s = mod.usePrefs.getState();
    expect(s.theme).toBe("system");
    expect(s.lang).toBe("en");
    expect(s.anonId.length).toBeGreaterThan(8);
  });
  it("persists the anon id immediately so it is stable across reloads", async () => {
    const id = mod.usePrefs.getState().anonId;
    expect(JSON.parse(localStorage.getItem("grow-ui")!).state.anonId).toBe(id);
    await mod.usePrefs.persist.rehydrate();
    expect(mod.usePrefs.getState().anonId).toBe(id);
  });
  it("sets theme and language", () => {
    mod.usePrefs.getState().setTheme("dark");
    mod.usePrefs.getState().setLang("hi");
    expect(mod.usePrefs.getState()).toMatchObject({ theme: "dark", lang: "hi" });
  });
});
