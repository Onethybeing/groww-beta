import { describe, it, expect, afterEach } from "vitest";
import { serverDeps } from "./server-deps";
import { getHistory } from "./history";
import { getInstrument } from "./instruments";

describe("serverDeps (frozen data)", () => {
  afterEach(() => { delete process.env.LIVE_DATA; });

  it("does not hit upstream unless LIVE_DATA=1", async () => {
    await expect(serverDeps.fetchLive(getInstrument("TCS.NS")!, AbortSignal.timeout(1000))).rejects.toThrow(/frozen/i);
  });

  it("serves the committed snapshot (last close 7 Oct 2026)", async () => {
    const r = await getHistory("RELIANCE.NS", serverDeps);
    expect(r.source).toBe("snapshot");
    expect(r.points.at(-1)).toEqual({ date: "2026-10-07", close: 1207.699951171875 });
  });
});
