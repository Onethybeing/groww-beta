"use client";
import Link from "next/link";
import { Bookmark, ChevronLeft } from "lucide-react";
import { useApp } from "@/lib/store";

export function DetailHeader({ back, symbol }: { back: string; symbol?: string }) {
  const watched = useApp((s) => (symbol ? s.watchlist.includes(symbol) : false));
  const toggleWatch = useApp((s) => s.toggleWatch);
  return (
    <header className="flex items-center justify-between px-3 py-2.5">
      <Link href={back} aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
      {symbol && (
        <button type="button" aria-pressed={watched} aria-label={watched ? "Remove from watchlist" : "Add to watchlist"} data-testid="watch-toggle"
          onClick={() => toggleWatch(symbol)} className="flex size-11 items-center justify-center">
          <Bookmark className={`size-[22px] ${watched ? "fill-groww text-groww" : ""}`} aria-hidden />
        </button>
      )}
    </header>
  );
}
