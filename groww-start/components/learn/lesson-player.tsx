"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Ban, BarChart3, Check, ChevronLeft, CircleCheck, Coins, Copy, Hourglass, Layers, Repeat, Scale, Tag, Waves, X,
} from "lucide-react";
import { RichText } from "./rich-text";
import { PriceChart } from "@/components/charts/price-chart";
import { useHistory } from "@/lib/market/client";
import { useApp } from "@/lib/store";
import { LESSONS, type Card, type Lesson, type LessonIconName } from "@/lib/content";

const ICONS: Record<LessonIconName, typeof Layers> = { Layers, Tag, Repeat, Scale, BarChart3, Copy, Coins, Waves, Hourglass, Ban };

function ChartCardView({ symbol }: { symbol: string }) {
  const { data } = useHistory(symbol);
  return data ? <PriceChart points={data.points} /> : <div className="h-[180px] animate-pulse rounded-xl bg-surface" />;
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const completeLesson = useApp((s) => s.completeLesson);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const card: Card = lesson.cards[i];
  const isLast = i === lesson.cards.length - 1;
  const canAdvance = card.type !== "quiz" || picked !== null;
  const next = () => { if (canAdvance && !isLast) setI(i + 1); };

  if (done) {
    const nextLesson = LESSONS.find((l) => l.order === lesson.order + 1);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220 }}
          className="flex size-20 items-center justify-center rounded-full bg-groww text-white">
          <Check className="size-10" strokeWidth={2.6} aria-hidden />
        </motion.span>
        <h1 className="text-2xl font-bold">Lesson complete</h1>
        <p className="text-[15px] text-muted-ink">Try it for real, risk-free: practise with ₹10,000 of virtual money.</p>
        <Link href="/practice" className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white">Go to Practice</Link>
        {nextLesson && (
          <Link href={`/learn/${nextLesson.id}`} className="flex h-12 w-full items-center justify-center text-[15px] font-semibold text-groww">Next lesson: {nextLesson.title}</Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-col gap-2.5 px-4 pb-1.5 pt-3.5">
        <div className="flex items-center gap-2">
          {i === 0 ? (
            <Link href="/practice" aria-label="Close lesson" className="flex size-11 items-center justify-center"><X className="size-[22px]" aria-hidden /></Link>
          ) : (
            <button onClick={() => { setI(i - 1); setPicked(null); }} aria-label="Previous card" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></button>
          )}
          <span className="flex-1 text-sm font-semibold text-muted-ink">{lesson.title} · {lesson.minutes} min</span>
        </div>
        <div className="grid gap-1.5 px-1" style={{ gridTemplateColumns: `repeat(${lesson.cards.length}, minmax(0, 1fr))` }}>
          {lesson.cards.map((_, k) => <div key={k} className={`h-[5px] rounded-full ${k <= i ? "bg-groww" : "bg-[#EEF0F2]"}`} />)}
        </div>
      </header>

      <main className="flex flex-1 flex-col px-5 py-3.5">
        <AnimatePresence mode="wait">
          <motion.article key={i} drag={canAdvance && !isLast ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => { if (info.offset.x < -80) next(); }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className={card.type === "quiz" ? "flex flex-col gap-4" : "flex flex-col gap-4 rounded-3xl border border-line p-[22px] shadow-[0_6px_20px_rgba(27,29,41,0.06)]"}>
            {card.type === "text" && (() => {
              const Icon = card.icon ? ICONS[card.icon] : null;
              return (
                <>
                  {Icon && (
                    <div className="flex h-[150px] items-center justify-center rounded-[18px] bg-mint">
                      <Icon className="size-24 text-groww" strokeWidth={1.4} aria-hidden />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold leading-[1.2] tracking-tight"><RichText text={card.title} /></h2>
                  <p className="text-base leading-[1.55] text-[#3D4050]"><RichText text={card.body} /></p>
                </>
              );
            })()}
            {card.type === "chart" && (
              <>
                <h2 className="text-2xl font-bold leading-[1.2]">{card.title}</h2>
                <ChartCardView symbol={card.symbol} />
                <p className="text-sm leading-[1.5] text-muted-ink">{card.body}</p>
              </>
            )}
            {card.type === "quiz" && (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-groww">Quick check</span>
                <h2 className="text-2xl font-bold leading-[1.25]">{card.question}</h2>
                <div className="flex flex-col gap-2.5">
                  {card.options.map((o, k) => {
                    const correct = k === card.answer;
                    const style = picked === null
                      ? "border-[1.5px] border-line text-ink"
                      : correct ? "border-2 border-groww bg-mint font-bold text-ink"
                      : k === picked ? "border-2 border-loss bg-[#FDECEA] text-ink" : "border-[1.5px] border-line text-[#8A8D9B]";
                    return (
                      <button key={o} disabled={picked !== null} onClick={() => setPicked(k)}
                        className={`flex min-h-14 items-center justify-between rounded-[14px] px-4 text-left text-[17px] font-semibold ${style}`}>
                        {o}
                        {picked !== null && correct && <span className="flex items-center gap-1.5 text-[13px] text-groww"><CircleCheck className="size-[18px]" aria-hidden />Correct</span>}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <div className="flex flex-col gap-1.5 rounded-2xl bg-surface p-4">
                    <b className="text-[15px]">{picked === card.answer ? "Nice!" : "Not quite."}</b>
                    <span className="text-sm leading-[1.5] text-[#3D4050]">{card.explanation}</span>
                  </div>
                )}
              </>
            )}
          </motion.article>
        </AnimatePresence>
        {card.type !== "quiz" && !isLast && <p className="mt-3.5 text-center text-[13px] text-muted-ink">Swipe left or tap Next</p>}
      </main>

      <footer className="flex flex-col gap-2.5 px-5 pb-[22px] pt-3">
        {!isLast ? (
          <button onClick={next} disabled={!canAdvance} className="flex h-[52px] items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white disabled:opacity-50">Next</button>
        ) : (
          <button disabled={!canAdvance} onClick={() => {
            const last = lesson.cards[lesson.cards.length - 1];
            completeLesson(lesson.id, last.type === "quiz" && picked === last.answer);
            setDone(true);
          }} className="flex h-[52px] items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white disabled:opacity-50">Finish lesson</button>
        )}
      </footer>
    </div>
  );
}
