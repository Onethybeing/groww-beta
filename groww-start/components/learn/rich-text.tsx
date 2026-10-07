"use client";
import { Explain } from "@/components/explain";
import { GLOSSARY_RE } from "@/lib/content";

/** Renders `[[key|Label]]` in lesson copy as a tappable "What's this?" term. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(GLOSSARY_RE)) {
    parts.push(text.slice(last, m.index));
    parts.push(<Explain key={`${m[1]}-${m.index}`} term={m[1]}>{m[2]}</Explain>);
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
