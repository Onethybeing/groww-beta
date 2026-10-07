import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { INSTRUMENTS, snapshotFileName } from "../lib/market/instruments";
import { fetchLive } from "../lib/market/sources";
import { trimToYears } from "../lib/market/history";

async function main() {
  const dir = path.join(process.cwd(), "data", "snapshot");
  await mkdir(dir, { recursive: true });
  for (const inst of INSTRUMENTS) {
    const points = trimToYears(await fetchLive(inst), 5);
    if (points.length < 200) throw new Error(`${inst.symbol}: only ${points.length} points`);
    await writeFile(path.join(dir, snapshotFileName(inst.symbol)), JSON.stringify(points));
    console.log(`${inst.symbol}: ${points.length} points, ${points[0].date} → ${points[points.length - 1].date}`);
    await new Promise((r) => setTimeout(r, 500)); // be polite to upstreams
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
