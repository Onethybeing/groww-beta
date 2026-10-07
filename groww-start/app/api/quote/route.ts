import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market/history";
import { getInstrument } from "@/lib/market/instruments";
import { serverDeps } from "@/lib/market/server-deps";

export async function GET(req: NextRequest) {
  const symbols = (req.nextUrl.searchParams.get("symbols") ?? "").split(",").filter(Boolean);
  if (symbols.length === 0 || symbols.some((s) => !getInstrument(s))) {
    return NextResponse.json({ error: "Unknown or missing symbols" }, { status: 400 });
  }
  const quotes = await getQuotes(symbols, serverDeps);
  return NextResponse.json({ quotes }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
}
