import { personaFor, type Answers } from "@/lib/engine/persona";
import { fundForCategory, type Instrument } from "@/lib/market/instruments";

/** The fund a beginner is pointed to first: index fund by default, liquid fund for short-term/emergency goals. */
export function starterFund(answers: Answers | null): Instrument {
  return fundForCategory(answers ? personaFor(answers).suggestedCategory : "index");
}

export const starterSipHref = (answers: Answers | null) => `/funds/${starterFund(answers).symbol}/sip`;
