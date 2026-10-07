import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PricePoint } from "@/lib/types";
import type { HistoryDeps } from "./history";
import { snapshotFileName } from "./instruments";
import { fetchLive } from "./sources";

export const serverDeps: HistoryDeps = {
  fetchLive,
  readSnapshot: async (symbol) => {
    const file = path.join(process.cwd(), "data", "snapshot", snapshotFileName(symbol));
    return JSON.parse(await readFile(file, "utf8")) as PricePoint[];
  },
};
