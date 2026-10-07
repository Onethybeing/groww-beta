"use client";
import Link from "next/link";
import { useRef } from "react";
import { useUi } from "@/lib/store/ui";

export function GrowwHeader() {
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const taps = useRef<number[]>([]);
  const onLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setDemoOpen(true);
    }
  };
  return (
    <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
      <div className="flex items-center gap-2">
        <button onClick={onLogoTap} className="text-[22px] font-bold tracking-tight text-groww" aria-label="Groww">Groww</button>
        <span className="rounded-full bg-[#F1F2F4] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-ink">Concept demo</span>
      </div>
      <Link href="/journey" className="text-sm font-semibold text-groww">My journey</Link>
    </header>
  );
}
