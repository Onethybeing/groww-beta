export type MilestoneKey = "first_lesson" | "three_lessons" | "first_time_machine" | "first_mock_buy" | "first_sip" | "streak_3";
export interface MilestoneInput { lessonsCompleted: number; timeMachineRuns: number; mockBuys: number; instalments: number; streak: number }

/** `icon` is a lucide-react icon name (the design uses line icons, no emoji). */
export type MilestoneIcon = "BookOpen" | "GraduationCap" | "Clock" | "FlaskConical" | "Sprout" | "Flame";

export const MILESTONES: Record<MilestoneKey, { title: string; icon: MilestoneIcon; description: string }> = {
  first_lesson: { title: "First lesson", icon: "BookOpen", description: "Finished your first 2-minute lesson" },
  three_lessons: { title: "Basics done", icon: "GraduationCap", description: "Completed all 3 starter lessons" },
  first_time_machine: { title: "Time traveller", icon: "Clock", description: "Replayed a SIP on real past data" },
  first_mock_buy: { title: "First practice buy", icon: "FlaskConical", description: "Made a buy with virtual money" },
  first_sip: { title: "First investment", icon: "Sprout", description: "Started your first SIP" },
  streak_3: { title: "3-month streak", icon: "Flame", description: "Invested 3 months in a row" },
};

export const MILESTONE_ORDER: MilestoneKey[] = ["first_lesson", "first_time_machine", "first_mock_buy", "first_sip", "streak_3", "three_lessons"];

const RULES: Record<MilestoneKey, (i: MilestoneInput) => boolean> = {
  first_lesson: (i) => i.lessonsCompleted >= 1,
  three_lessons: (i) => i.lessonsCompleted >= 3,
  first_time_machine: (i) => i.timeMachineRuns >= 1,
  first_mock_buy: (i) => i.mockBuys >= 1,
  first_sip: (i) => i.instalments >= 1,
  streak_3: (i) => i.streak >= 3,
};

export function evaluateMilestones(
  input: MilestoneInput,
  already: Partial<Record<MilestoneKey, string>>,
  today: string,
): Partial<Record<MilestoneKey, string>> {
  const out: Partial<Record<MilestoneKey, string>> = {};
  for (const key of MILESTONE_ORDER) if (!already[key] && RULES[key](input)) out[key] = today;
  return out;
}
