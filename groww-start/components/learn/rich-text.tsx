"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { GLOSSARY, GLOSSARY_RE } from "@/lib/content";

/** Renders `[[key|Label]]` as a tappable term that opens a 30-second explainer sheet. */
export function RichText({ text }: { text: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(GLOSSARY_RE)) {
    parts.push(text.slice(last, m.index));
    const key = m[1];
    parts.push(
      <button key={`${key}-${m.index}`} type="button" onClick={() => setOpen(key)}
        className="text-groww underline decoration-dotted underline-offset-[5px]">{m[2]}</button>,
    );
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(text.slice(last));
  const entry = open ? GLOSSARY[open] : null;
  return (
    <>
      {parts}
      <Sheet open={!!entry} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <SheetContent side="bottom" className="mx-auto max-w-[430px] gap-3 rounded-t-3xl px-[22px] pb-7 pt-4">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-groww">30-second explainer</span>
          <SheetTitle className="text-[22px] font-bold text-ink">{entry?.term}</SheetTitle>
          <SheetDescription className="text-[15px] leading-[1.55] text-[#3D4050]">{entry?.short}</SheetDescription>
          {entry?.example && (
            <div className="flex gap-2.5 rounded-[14px] bg-surface px-3.5 py-3 text-sm text-[#3D4050]">
              <Info className="mt-px size-[18px] flex-none text-groww" aria-hidden />
              <span>Example: {entry.example}</span>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
