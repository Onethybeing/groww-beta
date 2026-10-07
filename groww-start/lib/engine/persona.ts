export type Goal = "emergency" | "trip" | "studies" | "wealth" | "learning";
export type Experience = "never" | "fd" | "mf" | "stocks";
export type Budget = "100-500" | "500-2k" | "2k-5k" | "5k+";
export type Reaction = "sell" | "wait" | "buy";
export type Horizon = "lt1" | "1to3" | "3plus";
export interface Answers { goal: Goal; experience: Experience; budget: Budget; reaction: Reaction; horizon: Horizon }

export type PersonaId = "steady-starter" | "curious-explorer" | "goal-saver";
export interface PersonaResult {
  id: PersonaId; title: string; tagline: string;
  suggestedCategory: "index" | "liquid"; suggestedAmount: 100 | 250 | 500; path: string[];
}

const PERSONAS: Record<PersonaId, Omit<PersonaResult, "id" | "suggestedAmount">> = {
  "steady-starter": {
    title: "Steady Starter",
    tagline: "You think long-term and stay calm when prices dip. Let's turn that into a habit.",
    suggestedCategory: "index",
    path: ["Learn what a SIP is (2 min)", "Replay a monthly SIP on real past prices", "Start your first small SIP"],
  },
  "curious-explorer": {
    title: "Curious Explorer",
    tagline: "You're here to understand before you commit. Smart.",
    suggestedCategory: "index",
    path: ["Learn the basics in 3 short lessons", "Practise with ₹10,000 of virtual money", "Try a small SIP when you feel ready"],
  },
  "goal-saver": {
    title: "Goal Saver",
    tagline: "You've got something specific to save for. Let's keep it safe and on track.",
    suggestedCategory: "liquid",
    path: ["Learn why short-term money needs low risk", "See how a steady monthly amount adds up", "Start a small SIP towards your goal"],
  },
};

export const GOAL_DEFAULTS: Record<Goal, { name: string; target: number }> = {
  emergency: { name: "Emergency fund", target: 30000 },
  trip: { name: "Trip or gadget", target: 15000 },
  studies: { name: "Higher studies", target: 100000 },
  wealth: { name: "Long-term wealth", target: 100000 },
  learning: { name: "My first ₹5,000", target: 5000 },
};

export const PRESET_ANSWERS: Record<PersonaId, Answers> = {
  "steady-starter": { goal: "wealth", experience: "fd", budget: "500-2k", reaction: "wait", horizon: "3plus" },
  "curious-explorer": { goal: "learning", experience: "never", budget: "100-500", reaction: "wait", horizon: "3plus" },
  "goal-saver": { goal: "trip", experience: "fd", budget: "500-2k", reaction: "wait", horizon: "lt1" },
};

function personaId(a: Answers): PersonaId {
  if (a.horizon === "lt1" || a.goal === "emergency") return "goal-saver";
  if (a.goal === "learning" || a.experience === "never" || a.reaction === "sell") return "curious-explorer";
  return "steady-starter";
}

export function personaFor(a: Answers): PersonaResult {
  const id = personaId(a);
  const suggestedAmount = a.budget === "100-500" ? 100 : a.budget === "500-2k" ? 250 : 500;
  return { id, suggestedAmount, ...PERSONAS[id] };
}
