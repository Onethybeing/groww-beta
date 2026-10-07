/** Referral rewards are streak freezes only, never cash (in line with the draft SEBI ad code). */
export const MAX_REFERRAL_FREEZES = 3;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
const CODE_RE = /^GROW-[A-HJ-NP-Z2-9]{4}$/;

/** A short, stable invite code derived from the user's id (FNV-1a hash). */
export function referralCode(userId: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length);
  }
  return `GROW-${code}`;
}

export const normaliseCode = (code: string) => code.trim().toUpperCase();
export const isValidCode = (code: string) => CODE_RE.test(normaliseCode(code));

/** Bonus streak freezes: one per friend who joined, plus one for joining via an invite, capped. */
export function referralFreezes(friendsJoined: number, joinedViaInvite: boolean): number {
  return Math.min(MAX_REFERRAL_FREEZES, friendsJoined + (joinedViaInvite ? 1 : 0));
}
