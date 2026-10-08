import l1 from "@/content/lessons/mutual-funds-sip.json";
import l2 from "@/content/lessons/index-funds.json";
import l3 from "@/content/lessons/ups-and-downs.json";
import glossary from "@/content/glossary.json";
import type { Glossary, Lesson } from "./schema";

export type { Lesson, Card, LessonIconName, Glossary } from "./schema";

// JSON imports widen literal unions, hence the casts. Content is schema-validated in lib/content/content.test.ts (CI), so zod stays out of the client bundle.
export const LESSONS: Lesson[] = ([l1, l2, l3] as Lesson[]).sort((a, b) => a.order - b.order);
export const GLOSSARY: Glossary = glossary;
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

export const GLOSSARY_RE = /\[\[([a-z_]+)\|([^\]]+)\]\]/g;
export const glossaryRefs = (text: string) => [...text.matchAll(GLOSSARY_RE)].map((m) => m[1]);
