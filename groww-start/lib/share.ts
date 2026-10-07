import { MILESTONES, type MilestoneKey } from "@/lib/engine/milestones";
import type { PersonaId } from "@/lib/engine/persona";

export interface ShareStats { milestone: MilestoneKey | null; streak: number; lessons: number; persona?: PersonaId }

const PERSONA_TITLES: Record<PersonaId, string> = {
  "steady-starter": "Steady Starter", "curious-explorer": "Curious Explorer", "goal-saver": "Goal Saver",
};

export function shareHref(key: MilestoneKey, stats: Omit<ShareStats, "milestone">): string {
  const q = new URLSearchParams({ streak: String(stats.streak), lessons: String(stats.lessons) });
  if (stats.persona) q.set("persona", stats.persona);
  return `/share/${key}?${q.toString()}`;
}

const clampInt = (v: string | undefined) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(999, Math.max(0, n)) : 0;
};

export function parseShareParams(params: Record<string, string | undefined>, key: string): ShareStats {
  const persona = params.persona && params.persona in PERSONA_TITLES ? (params.persona as PersonaId) : undefined;
  return {
    milestone: key in MILESTONES ? (key as MilestoneKey) : null,
    streak: clampInt(params.streak),
    lessons: clampInt(params.lessons),
    persona,
  };
}

export function cardLines(s: ShareStats): { headline: string; sub: string; chips: string[] } {
  const chips: string[] = [];
  if (s.streak > 0) chips.push(`${s.streak}-month SIP streak`);
  if (s.lessons > 0) chips.push(`${s.lessons} lesson${s.lessons === 1 ? "" : "s"}`);
  if (s.persona) chips.push(PERSONA_TITLES[s.persona]);
  if (!s.milestone) return { headline: "Started my investing journey", sub: "Learning, practising, building the habit.", chips };
  const m = MILESTONES[s.milestone];
  return { headline: m.title, sub: m.description, chips };
}
