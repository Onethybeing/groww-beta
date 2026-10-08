import { z } from "zod";

/** Lucide icon names allowed on text cards (the design uses line icons, no emoji). */
export const LESSON_ICON_NAMES = [
  "Layers", "Tag", "Repeat", "Scale", "BarChart3", "Copy", "Coins", "Waves", "Hourglass", "Ban",
] as const;

const TextCard = z.object({
  type: z.literal("text"), icon: z.enum(LESSON_ICON_NAMES).optional(), title: z.string().min(1), body: z.string().min(1),
});
const ChartCard = z.object({ type: z.literal("chart"), title: z.string(), body: z.string(), symbol: z.string() });
const QuizCard = z.object({
  type: z.literal("quiz"), question: z.string(), options: z.array(z.string()).min(2).max(4),
  answer: z.number().int().nonnegative(), explanation: z.string(),
}).refine((q) => q.answer < q.options.length, { message: "answer index out of range" });

export const CardSchema = z.union([TextCard, ChartCard, QuizCard]);
export const LessonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), title: z.string(), minutes: z.number(),
  cards: z.array(CardSchema).min(3),
});
export const GlossarySchema = z.record(z.string(), z.object({ term: z.string(), short: z.string(), lesson: z.string().optional() }));

export type Card = z.infer<typeof CardSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Glossary = z.infer<typeof GlossarySchema>;
export type LessonIconName = (typeof LESSON_ICON_NAMES)[number];
