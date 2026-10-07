"use client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, useToday } from "@/lib/store";
import { useUi } from "@/lib/store/ui";
import { formatDate } from "@/lib/format";
import type { PersonaId } from "@/lib/engine/persona";

const PRESETS: [PersonaId, string][] = [
  ["steady-starter", "Steady Starter"],
  ["curious-explorer", "Curious Explorer"],
  ["goal-saver", "Goal Saver"],
];

export function DemoPanel() {
  const today = useToday();
  const hasSip = useApp((s) => s.sipPlan !== null);
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const { reset, applyPreset, advanceMonth } = useApp.getState();
  return (
    <div data-testid="demo-panel" className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-3xl border border-line bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-bold">Demo controls</p>
        <span className="flex-1 text-xs text-muted-ink">Demo date: {formatDate(today)}</span>
        <button onClick={() => setDemoOpen(false)} aria-label="Close demo controls" className="flex size-11 items-center justify-center">
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => advanceMonth(false)} disabled={!hasSip}>+1 month</Button>
        <Button variant="outline" onClick={() => advanceMonth(true)} disabled={!hasSip}>+1 month (skip SIP)</Button>
        {PRESETS.map(([id, label]) => (
          <Button key={id} variant="outline" onClick={() => applyPreset(id)}>Persona: {label}</Button>
        ))}
        <Button variant="destructive" onClick={() => { reset(); location.assign("/"); }}>Reset demo</Button>
      </div>
      {!hasSip && <p className="mt-2 text-xs text-muted-ink">Start a SIP to unlock time travel.</p>}
    </div>
  );
}
