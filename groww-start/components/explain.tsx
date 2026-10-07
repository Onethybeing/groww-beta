"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, CircleHelp } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { GLOSSARY, getLesson } from "@/lib/content";

/**
 * A tappable term that opens a 30-second "What's this?" sheet.
 * `forYou` adds a line computed from the screen's real numbers.
 */
export function Explain({ term, children, forYou, icon = false, className = "" }: {
  term: string; children: React.ReactNode; forYou?: string; icon?: boolean; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[term];
  if (!entry) return <>{children}</>;
  const lesson = entry.lesson ? getLesson(entry.lesson) : undefined;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-groww underline decoration-dotted underline-offset-[4px] ${className}`}>
        {children}
        {icon && <CircleHelp className="size-3.5" aria-hidden />}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[430px] gap-3 rounded-t-3xl px-[22px] pb-7 pt-4">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-groww">What&apos;s this?</span>
          <SheetTitle className="text-[22px] font-bold text-ink">{entry.term}</SheetTitle>
          <SheetDescription className="text-[15px] leading-[1.55] text-[#3D4050]">{entry.short}</SheetDescription>
          {forYou && (
            <div className="flex flex-col gap-1.5 rounded-[14px] bg-surface px-3.5 py-3 text-sm leading-[1.5] text-[#3D4050]">
              <b className="text-ink">For you, right now</b>
              <span>{forYou}</span>
            </div>
          )}
          {lesson && (
            <Link href={`/learn/${lesson.id}`} onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between rounded-[14px] border border-line px-3.5 text-sm font-bold text-groww">
              2-min basics: {lesson.title}
              <ChevronRight className="size-[18px]" aria-hidden />
            </Link>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
