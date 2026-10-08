"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useApp, type WelcomeAnswers } from "@/lib/store";

const QUESTIONS: { key: keyof WelcomeAnswers; label: string; options: [string, string][] }[] = [
  { key: "goal", label: "What are you investing for?", options: [["emergency", "Emergency fund"], ["trip", "Trip or gadget"], ["studies", "Higher studies"], ["wealth", "Long-term wealth"], ["learning", "Just learning"]] },
  { key: "experience", label: "Invested before?", options: [["never", "Never"], ["fd", "FD / RD"], ["mf", "Mutual funds"], ["stocks", "Stocks"]] },
  { key: "budget", label: "Comfortable monthly amount", options: [["100-500", "₹100–500"], ["500-2k", "₹500–2k"], ["2k-5k", "₹2k–5k"], ["5k+", "₹5k+"]] },
  { key: "horizon", label: "When will you need the money?", options: [["lt1", "< 1 year"], ["1to3", "1–3 years"], ["3plus", "3+ years"]] },
];

/** Optional new-user prompt: 4 taps turn on beginner hints. Shown once. */
export function WelcomeSheet() {
  const welcomeSeen = useApp((s) => s.welcomeSeen);
  const setWelcome = useApp((s) => s.setWelcome);
  const [answers, setAnswers] = useState<Partial<WelcomeAnswers>>({});
  const complete = QUESTIONS.every((q) => answers[q.key]);

  return (
    <Sheet open={!welcomeSeen} onOpenChange={(open) => { if (!open) setWelcome(null); }}>
      <SheetContent side="bottom" showCloseButton={false} data-testid="welcome-sheet" className="mx-auto max-h-[92dvh] max-w-[430px] gap-4 overflow-y-auto rounded-t-3xl px-[22px] pb-[26px] pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-groww">Optional · 30 seconds</span>
          <SheetTitle className="text-[22px] font-bold leading-[1.25] text-ink">New to investing? Tell us 4 things and we&apos;ll add hints where you need them.</SheetTitle>
        </div>
        {QUESTIONS.map((q) => (
          <div key={q.key} className="flex flex-col gap-2" role="group" aria-label={q.label}>
            <span className="text-[13px] font-semibold text-muted-ink">{q.label}</span>
            <div className="flex flex-wrap gap-2">
              {q.options.map(([value, label]) => {
                const on = answers[q.key] === value;
                return (
                  <button key={value} type="button" aria-pressed={on} onClick={() => setAnswers({ ...answers, [q.key]: value })}
                    className={`h-[38px] rounded-full px-3.5 text-sm ${on ? "border-[1.5px] border-groww bg-mint font-bold text-groww" : "border border-line text-ink"}`}>{label}</button>
                );
              })}
            </div>
          </div>
        ))}
        <SheetDescription className="text-[13px] leading-[1.45] text-muted-ink">
          You&apos;ll see short &ldquo;What&apos;s this?&rdquo; explainers, a Practice tab with virtual money, and small-amount SIP options. Turn hints off anytime.
        </SheetDescription>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => setWelcome(null)} className="h-[50px] rounded-[14px] border-[1.5px] border-line text-[15px] font-bold">Skip for now</button>
          <button type="button" disabled={!complete} onClick={() => setWelcome(answers as WelcomeAnswers)}
            className="h-[50px] rounded-[14px] bg-brand-surface text-[15px] font-bold text-white disabled:opacity-50">Turn on hints</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
