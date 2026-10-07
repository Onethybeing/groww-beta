import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PricePoint } from "@/lib/types";
import type { HistoryDeps } from "./history";
import { snapshotFileName } from "./instruments";
import { fetchLive } from "./sources";

const cache = new Map<string, Promise<PricePoint[]>>();

/**
 * Market data is frozen to the committed snapshot (real data up to 6–7 Oct 2026) so the demo is deterministic
 * and never shows real-time prices. Set LIVE_DATA=1 to fetch Yahoo/mfapi (falling back to the snapshot on failure).
 */
export const serverDeps: HistoryDeps = {
  get live() {
    return process.env.LIVE_DATA === "1";
  },
  fetchLive,
  readSnapshot: (symbol) => {
    let hit = cache.get(symbol);
    if (!hit) {
      const file = path.join(process.cwd(), "data", "snapshot", snapshotFileName(symbol));
      hit = readFile(file, "utf8").then((s) => JSON.parse(s) as PricePoint[]);
      hit.catch(() => cache.delete(symbol));
      cache.set(symbol, hit);
    }
    return hit;
  },
};
