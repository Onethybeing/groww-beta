import { dateInMonth, monthKey, nextMonthKey } from "./dates";
import { dueInstalments, MIN_SIP, type Instalment, type SipPlan } from "./instalments";
import { round2 } from "./num";

export type SipStatus = "active" | "paused" | "cancelled";
export interface Sip extends SipPlan { id: string; status: SipStatus }
export interface SipInstalment extends Instalment { sipId: string }

const forSip = (list: SipInstalment[], id: string) => list.filter((i) => i.sipId === id);

/**
 * Collect every active SIP's due instalments up to `today`, paying them from the demo wallet in date order.
 * An instalment the wallet can't cover is recorded as missed (and never retried for that month).
 */
export function collectDue(
  sips: Sip[], existing: SipInstalment[], skippedMonths: string[], today: string, wallet: number, missedSoFar: SipInstalment[] = [],
): { paid: SipInstalment[]; missed: SipInstalment[]; wallet: number } {
  const due = sips
    .filter((s) => s.status === "active")
    .flatMap((s) => dueInstalments(s, [...forSip(existing, s.id), ...forSip(missedSoFar, s.id)], skippedMonths, today).map((i) => ({ ...i, sipId: s.id })))
    .sort((a, b) => a.date.localeCompare(b.date));
  const paid: SipInstalment[] = [];
  const missed: SipInstalment[] = [];
  let balance = wallet;
  for (const inst of due) {
    if (inst.amount <= balance + 1e-9) {
      balance = round2(balance - inst.amount);
      paid.push(inst);
    } else missed.push(inst);
  }
  return { paid, missed, wallet: balance };
}

export type SipPatch = Partial<Pick<Sip, "amount" | "day" | "status">>;

export function updateSip(sips: Sip[], id: string, patch: SipPatch): { ok: true; sips: Sip[] } | { ok: false; error: string } {
  const current = sips.find((s) => s.id === id);
  if (!current) return { ok: false, error: "SIP not found" };
  if (current.status === "cancelled") return { ok: false, error: "This SIP is cancelled" };
  if (patch.amount !== undefined && (!Number.isFinite(patch.amount) || patch.amount < MIN_SIP)) return { ok: false, error: `Minimum SIP is ₹${MIN_SIP}` };
  if (patch.day !== undefined && (!Number.isInteger(patch.day) || patch.day < 1 || patch.day > 28)) return { ok: false, error: "Pick a SIP date between 1 and 28" };
  return { ok: true, sips: sips.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
}

/** The next date this SIP will debit: this month's SIP day if it hasn't run yet, else next month's. */
export function nextSipDate(sip: Sip, instalments: SipInstalment[], today: string): string {
  const key = monthKey(today);
  const paidThisMonth = forSip(instalments, sip.id).some((i) => monthKey(i.date) === key);
  const thisMonth = dateInMonth(key, sip.day);
  return thisMonth > today && !paidThisMonth ? thisMonth : dateInMonth(nextMonthKey(key), sip.day);
}
