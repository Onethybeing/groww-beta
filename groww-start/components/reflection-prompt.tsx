"use client";
import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { useApp } from "@/lib/store";

const CHIPS = ["It's low-cost", "I know the company", "A friend mentioned it", "Just curious"];

export function ReflectionPrompt({ prompt, onDone }: { prompt: string; onDone: () => void }) {
  const addReflection = useApp((s) => s.addReflection);
  const [answer, setAnswer] = useState("");
  return (
    <div data-testid="reflection" className="flex flex-col gap-3 rounded-[18px] border border-tip-line bg-mint p-4">
      <p className="flex items-center gap-2 text-[15px] font-semibold">
        <MessageCircleQuestion className="size-5 text-groww" aria-hidden />{prompt}
      </p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button key={c} type="button" onClick={() => setAnswer(c)}
            className={`rounded-full border px-3 py-1.5 text-[13px] ${answer === c ? "border-groww bg-card font-semibold text-groww" : "border-line bg-card"}`}>{c}</button>
        ))}
      </div>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={200} rows={2} aria-label="Your answer"
        className="w-full rounded-xl border border-line bg-card p-2.5 text-sm" placeholder="In your own words (optional)" />
      <div className="flex gap-2">
        <button type="button" disabled={!answer.trim()} onClick={() => { addReflection(prompt, answer.trim()); onDone(); }}
          className="h-10 rounded-xl bg-brand-surface px-4 text-sm font-bold text-white disabled:opacity-50">Save</button>
        <button type="button" onClick={onDone} className="h-10 rounded-xl px-4 text-sm font-semibold text-muted-ink">Skip</button>
      </div>
    </div>
  );
}
