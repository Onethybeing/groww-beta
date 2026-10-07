"use client";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { LESSONS } from "@/lib/content";
import { useApp } from "@/lib/store";

export default function LearnPage() {
  const done = useApp((s) => s.lessons);
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <h1 className="text-[22px] font-bold">Learn</h1>
      <p className="text-sm text-muted-ink">2-minute lessons in plain language, each with one quick check.</p>
      {LESSONS.map((l) => (
        <Link key={l.id} href={`/learn/${l.id}`} className="flex min-h-[72px] items-center gap-3.5 rounded-2xl border border-line px-3.5 py-3">
          <span className={`flex size-10 items-center justify-center rounded-full font-bold ${done[l.id] ? "bg-groww text-white" : "bg-mint text-groww"}`}>
            {done[l.id] ? <Check className="size-5" strokeWidth={2.4} aria-hidden /> : l.order}
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <b className="text-base">{l.title}</b>
            <span className="text-[13px] text-muted-ink">{l.minutes} min · {l.cards.length} cards</span>
          </span>
          <ChevronRight className="size-5 text-[#8A8D9B]" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
