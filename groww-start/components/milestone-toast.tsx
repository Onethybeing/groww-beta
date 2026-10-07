"use client";
import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";
import { totalFreezesOf, useApp, useToday } from "@/lib/store";
import { computeStreak } from "@/lib/engine/streak";
import { MILESTONES, type MilestoneKey } from "@/lib/engine/milestones";
import { personaFor } from "@/lib/engine/persona";
import { shareHref } from "@/lib/share";
import { MilestoneIcon } from "./milestone-icon";

export function useShareHref(key: MilestoneKey): string {
  const today = useToday();
  const instalments = useApp((s) => s.instalments);
  const freezes = useApp(totalFreezesOf);
  const lessons = useApp((s) => Object.keys(s.lessons).length);
  const answers = useApp((s) => s.answers);
  return shareHref(key, {
    streak: computeStreak(instalments.map((i) => i.date), today, freezes).current,
    lessons,
    persona: answers ? personaFor(answers).id : undefined,
  });
}

export function MilestoneToast() {
  const key = useApp((s) => s.newMilestone);
  const dismiss = useApp((s) => s.dismissMilestone);
  const href = useShareHref(key ?? "first_lesson");
  // Auto-dismiss so the toast never blocks the page's own buttons for long
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [key, dismiss]);
  if (!key) return null;
  const m = MILESTONES[key];
  return (
    <div role="status" data-testid="milestone-toast" className="fixed inset-x-0 top-3 z-40 mx-auto flex max-w-[400px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg">
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
        <MilestoneIcon name={m.icon} className="size-5 text-[#7BE0BC]" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">Milestone: {m.title}</p>
        <p className="text-xs text-white/70">{m.description}</p>
      </div>
      <Link href={href} onClick={dismiss} className="text-sm font-semibold text-[#7BE0BC]">Share</Link>
      <button onClick={dismiss} aria-label="Dismiss" className="flex size-8 items-center justify-center text-white/60">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
