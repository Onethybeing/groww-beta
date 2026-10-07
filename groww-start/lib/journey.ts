import type { AppData } from "@/lib/store";

export const FIRST_LESSON_ID = "mutual-funds-sip";

export function journeyStatus(s: Pick<AppData, "lessons" | "sipPlan" | "milestones">) {
  const practiceUnlocked = Boolean(s.lessons[FIRST_LESSON_ID]);
  return {
    lessonsDone: Object.keys(s.lessons).length,
    practiceUnlocked,
    investUnlocked: practiceUnlocked,
    hasSip: s.sipPlan !== null,
    shareUnlocked: Object.keys(s.milestones).length > 0,
  };
}
