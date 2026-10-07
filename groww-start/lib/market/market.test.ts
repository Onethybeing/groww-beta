import { describe, it, expect } from "vitest";
import { parseYahooChart, parseMfapi } from "./sources";
import { getHistory, getQuotes, trimToYears, UnknownSymbolError, type HistoryDeps } from "./history";
import { getInstrument, fundForCategory, snapshotFileName, INSTRUMENTS } from "./instruments";

const snap = [{ date: "2026-10-05", close: 10 }, { date: "2026-10-06", close: 11 }];

describe("parsers", () => {
  it("parses Yahoo chart JSON in IST and drops null closes", () => {
    const json = { chart: { result: [{ meta: { gmtoffset: 19800 }, timestamp: [1791259200, 1791345600, 1791432000],
      indicators: { quote: [{ close: [100.5, null, 102] }] } }] } };
    expect(parseYahooChart(json)).toEqual([{ date: "2026-10-06", close: 100.5 }, { date: "2026-10-08", close: 102 }]);
  });
  it("throws on an empty Yahoo result", () => {
    expect(() => parseYahooChart({ chart: { result: null } })).toThrow();
  });
  it("parses mfapi (newest first, DD-MM-YYYY) into ascending points", () => {
    const json = { data: [{ date: "06-10-2026", nav: "51.20" }, { date: "03-10-2026", nav: "50.00" }] };
    expect(parseMfapi(json)).toEqual([{ date: "2026-10-03", close: 50 }, { date: "2026-10-06", close: 51.2 }]);
  });
});

describe("instruments", () => {
  it("has the curated universe", () => {
    expect(INSTRUMENTS.filter((i) => i.kind === "stock")).toHaveLength(12);
    expect(getInstrument("MF120716")?.mfCode).toBe(120716);
    expect(fundForCategory("liquid").mfCode).toBe(143269);
    expect(snapshotFileName("^NSEI")).toBe("_NSEI.json");
  });
});

describe("getHistory", () => {
  const ok: HistoryDeps = { fetchLive: async () => [{ date: "2026-10-06", close: 99 }, { date: "2026-10-07", close: 100 }], readSnapshot: async () => snap };
  it("returns live data when available", async () => {
    expect((await getHistory("TCS.NS", ok)).source).toBe("live");
  });
  it("falls back to snapshot on upstream error", async () => {
    const r = await getHistory("TCS.NS", { ...ok, fetchLive: async () => { throw new Error("429"); } });
    expect(r).toEqual({ symbol: "TCS.NS", points: snap, source: "snapshot" });
  });
  it("falls back to snapshot when upstream returns too few points", async () => {
    const r = await getHistory("TCS.NS", { ...ok, fetchLive: async () => [] });
    expect(r.source).toBe("snapshot");
  });
  it("in frozen mode reads the snapshot without calling upstream", async () => {
    let calls = 0;
    const r = await getHistory("TCS.NS", { live: false, fetchLive: async () => { calls++; return []; }, readSnapshot: async () => snap });
    expect(r).toEqual({ symbol: "TCS.NS", points: snap, source: "snapshot" });
    expect(calls).toBe(0);
  });
  it("rejects unknown symbols", async () => {
    await expect(getHistory("EVIL", ok)).rejects.toBeInstanceOf(UnknownSymbolError);
  });
  it("builds quotes with day change", async () => {
    const [q] = await getQuotes(["TCS.NS"], ok);
    expect(q).toEqual({ symbol: "TCS.NS", date: "2026-10-07", price: 100, changePct: 1.01, source: "live" });
  });
  it("trims to N years from the last point", () => {
    const pts = [{ date: "2019-01-01", close: 1 }, { date: "2025-01-01", close: 2 }, { date: "2026-10-07", close: 3 }];
    expect(trimToYears(pts, 5).map((p) => p.date)).toEqual(["2025-01-01", "2026-10-07"]);
  });
});
