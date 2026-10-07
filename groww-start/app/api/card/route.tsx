import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { cardLines, parseShareParams } from "@/lib/share";
import { GROW_WAVE_PATH } from "@/components/brand/grow-logo";

const font = (w: 400 | 700 | 800) => readFile(path.join(process.cwd(), "assets", "fonts", `dm-sans-${w}.woff`));

const FLAME = "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z";
const SPROUT = ["M7 20h10", "M12 20v-8", "M12 12c0-4 3-6 7-6 0 4-3 6-7 6z", "M12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"];

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const stats = parseShareParams(params, params.m ?? "");
  const { headline, sub, chips } = cardLines(stats);
  const paths = stats.milestone === "streak_3" ? [FLAME] : SPROUT;
  const [regular, bold, extra] = await Promise.all([font(400), font(700), font(800)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 104, background: "#0B7A55", color: "white", fontFamily: "DM Sans" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 64, fontWeight: 800, letterSpacing: 3 }}>
          <svg width="84" height="84" viewBox="0 0 32 32" style={{ marginRight: 24 }}>
            <circle cx="16" cy="16" r="16" fill="#FFFFFF" />
            <circle cx="27" cy="10.5" r="2.2" fill="#7BE0BC" />
            <path d={GROW_WAVE_PATH} fill="none" stroke="#0B7A55" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          GROW
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, marginLeft: 20, padding: "6px 18px", borderRadius: 999, background: "#138A63", letterSpacing: 1 }}>BETA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 200, height: 200, borderRadius: 64, background: "#138A63" }}>
            <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {paths.map((d) => <path key={d} d={d} />)}
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 44, color: "#BFF0DE", marginTop: 56 }}>Milestone unlocked</div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 1.02, letterSpacing: -4, marginTop: 20 }}>{headline}</div>
          <div style={{ display: "flex", fontSize: 50, color: "#E3F7EF", marginTop: 36 }}>{sub}</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 64 }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", fontSize: 42, fontWeight: 600, padding: "18px 36px", borderRadius: 999, background: "#138A63", marginRight: 22, marginBottom: 22 }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 34, color: "#BFF0DE" }}>
          <div style={{ display: "flex" }}>Learning → Practising → Investing</div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 10, opacity: 0.85 }}>GROW Beta concept demo · not affiliated with Groww · demo money</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "DM Sans", data: regular, weight: 400, style: "normal" },
        { name: "DM Sans", data: bold, weight: 700, style: "normal" },
        { name: "DM Sans", data: extra, weight: 800, style: "normal" },
      ],
    },
  );
}
