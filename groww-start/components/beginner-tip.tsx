"use client";
import { Lightbulb } from "lucide-react";
import { useApp } from "@/lib/store";

/** A plain-language tip shown only while beginner hints are on. */
export function BeginnerTip({ title, children }: { title: string; children: React.ReactNode }) {
  const hintsOn = useApp((s) => s.hintsOn);
  if (!hintsOn) return null;
  return (
    <div data-testid="beginner-tip" className="flex gap-2.5 rounded-[14px] border border-tip-line bg-tip px-3.5 py-3">
      <Lightbulb className="mt-px size-5 flex-none text-groww" aria-hidden />
      <span className="text-[13px] leading-[1.5] text-ink-2"><b className="text-ink">{title}</b> {children}</span>
    </div>
  );
}
