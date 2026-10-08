"use client";
import Link from "next/link";
import { useRef } from "react";
import { Search } from "lucide-react";
import { useUi } from "@/lib/store/ui";
import { GrowLogo } from "@/components/brand/grow-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToday, useApp } from "@/lib/store";
import { formatDate } from "@/lib/format";

/** GROW Beta top bar with the Explore / Holdings switch. Tapping the wordmark 5× opens demo controls. */
export function AppHeader({ active }: { active: "explore" | "holdings" }) {
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const offset = useApp((s) => s.clockOffsetDays);
  const today = useToday();
  const taps = useRef<number[]>([]);
  const onLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setDemoOpen(true);
    }
  };
  const tab = (key: "explore" | "holdings", label: string, href: string) =>
    active === key ? (
      <span className="border-b-[2.5px] border-groww py-2.5 text-[15px] font-bold">{label}</span>
    ) : (
      <Link href={href} className="py-2.5 text-[15px] font-medium text-muted-ink">{label}</Link>
    );
  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
        <button onClick={onLogoTap} aria-label="GROW Beta" className="lg:invisible"><GrowLogo /></button>
        <div className="flex items-center gap-1">
          {offset > 0 && <span className="text-xs text-muted-ink">Demo date: {formatDate(today)}</span>}
          <ThemeToggle />
          <Link href="/search" aria-label="Search" className="flex size-11 items-center justify-center"><Search className="size-[22px]" aria-hidden /></Link>
        </div>
      </header>
      <div className="flex gap-[18px] border-b border-line px-5">
        {tab("explore", "Explore", "/")}
        {tab("holdings", "Holdings", "/holdings")}
      </div>
    </>
  );
}
