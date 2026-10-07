import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PricePoint } from "@/lib/types";
import type { HistoryDeps } from "./history";
import { snapshotFileName } from "./instruments";
import { fetchLive } from "./sources";

/**
 * Market data is frozen to the committed snapshot (real data as of 7 Oct 2026) so the demo is deterministic
 * and never shows real-time prices. Set LIVE_DATA=1 to fetch Yahoo/mfapi instead.
 */
export const serverDeps: HistoryDeps = {
  fetchLive: (inst, signal) =>
    process.env.LIVE_DATA === "1" ? fetchLive(inst, signal) : Promise.reject(new Error("Frozen data mode: live fetch disabled")),
  readSnapshot: async (symbol) => {
    const file = path.join(process.cwd(), "data", "snapshot", snapshotFileName(symbol));
    return JSON.parse(await readFile(file, "utf8")) as PricePoint[];
  },
};
