import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { serverDeps } from "./server-deps";
import { getHistory } from "./history";

const original = process.env.LIVE_DATA;

describe("serverDeps (frozen data)", () => {
  beforeEach(() => { delete process.env.LIVE_DATA; });
  afterEach(() => {
    if (original === undefined) delete process.env.LIVE_DATA;
    else process.env.LIVE_DATA = original;
  });

  it("is frozen unless LIVE_DATA=1", () => {
    expect(serverDeps.live).toBe(false);
    process.env.LIVE_DATA = "1";
    expect(serverDeps.live).toBe(true);
  });

  it("serves the committed snapshot (last close 7 Oct 2026)", async () => {
    const r = await getHistory("RELIANCE.NS", serverDeps);
    expect(r.source).toBe("snapshot");
    expect(r.points.at(-1)).toEqual({ date: "2026-10-07", close: 1207.699951171875 });
  });

  it("caches snapshot reads", async () => {
    const a = await serverDeps.readSnapshot("TCS.NS");
    const b = await serverDeps.readSnapshot("TCS.NS");
    expect(a).toBe(b);
  });
});
