import l1 from "@/content/lessons/mutual-funds-sip.json";
import l2 from "@/content/lessons/index-funds.json";
import l3 from "@/content/lessons/ups-and-downs.json";
import glossary from "@/content/glossary.json";
import { GlossarySchema, LessonSchema, type Lesson } from "./schema";

export type { Lesson, Card, LessonIconName } from "./schema";

export const LESSONS: Lesson[] = [l1, l2, l3].map((l) => LessonSchema.parse(l)).sort((a, b) => a.order - b.order);
export const GLOSSARY = GlossarySchema.parse(glossary);
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

export const GLOSSARY_RE = /\[\[([a-z_]+)\|([^\]]+)\]\]/g;
export const glossaryRefs = (text: string) => [...text.matchAll(GLOSSARY_RE)].map((m) => m[1]);
