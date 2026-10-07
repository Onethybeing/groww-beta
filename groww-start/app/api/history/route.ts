import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/market/history";
import { getInstrument } from "@/lib/market/instruments";
import { serverDeps } from "@/lib/market/server-deps";

const CACHE = { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" };

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "";
  if (!getInstrument(symbol)) return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  return NextResponse.json(await getHistory(symbol, serverDeps), { headers: CACHE });
}
