"use client";
import Link from "next/link";
import { useState } from "react";
import { Lock } from "lucide-react";
import { TimeMachine } from "@/components/practice/time-machine";
import { MockPortfolio } from "@/components/practice/mock-portfolio";
import { useApp } from "@/lib/store";
import { FIRST_LESSON_ID, journeyStatus } from "@/lib/journey";

const TABS = [
  { id: "time-machine", label: "Time Machine" },
  { id: "mock", label: "Mock portfolio" },
] as const;

export default function PracticePage() {
  const state = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("time-machine");

  if (!journeyStatus(state).practiceUnlocked) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-muted-ink"><Lock className="size-6" aria-hidden /></span>
        <p className="text-lg font-bold">Finish lesson 1 to unlock Practice</p>
        <Link href={`/learn/${FIRST_LESSON_ID}`} className="font-semibold text-groww underline">Start the 2-minute lesson</Link>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-2.5 border-b border-line px-5 pb-2.5 pt-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold">Practice</h1>
          <span className="rounded-full bg-[#FFF4E0] px-2.5 py-[5px] text-xs font-semibold text-[#8A4B00]">Virtual money · Prices delayed</span>
        </div>
        <div role="tablist" aria-label="Practice modes" className="grid grid-cols-2 gap-1 rounded-xl bg-[#F1F2F4] p-1">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`h-10 rounded-[9px] text-sm ${tab === t.id ? "bg-white font-bold text-ink shadow-[0_1px_3px_rgba(27,29,41,0.1)]" : "font-semibold text-muted-ink"}`}>{t.label}</button>
          ))}
        </div>
      </header>
      <div className="px-5 py-3.5">
        {tab === "time-machine" ? <TimeMachine /> : <MockPortfolio />}
        <p className="mt-4 text-center text-xs text-muted-ink">Virtual money · Prices delayed · Not a prediction</p>
      </div>
    </>
  );
}
