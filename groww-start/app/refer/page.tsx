"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Gift, Share2, Snowflake, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { myCodeOf, totalFreezesOf, useApp } from "@/lib/store";
import { MAX_REFERRAL_FREEZES, referralFreezes } from "@/lib/engine/referrals";
import { formatDate } from "@/lib/format";

export default function ReferPage() {
  const code = useApp(myCodeOf);
  const referrals = useApp((s) => s.referrals);
  const joinedViaInvite = useApp((s) => s.referredBy !== null);
  const freezes = useApp(totalFreezesOf);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const link = typeof window === "undefined" ? `/r/${code}` : `${window.location.origin}/r/${code}`;
  const capped = referralFreezes(referrals.length, joinedViaInvite) >= MAX_REFERRAL_FREEZES;
  /** Friend i earned a freeze only while under the cap. */
  const earned = (i: number) => referralFreezes(i + 1, joinedViaInvite) > referralFreezes(i, joinedViaInvite);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const share = async () => {
    const text = `I'm building an investing habit on GROW Beta (a concept demo). Join with my invite and we both get a streak freeze: ${link}`;
    if (navigator.share) await navigator.share({ text, url: link }).catch(() => {});
    else await copy();
  };

  return (
    <>
      <PageHeader title="Invite friends" back="/holdings" />
      <div className="flex flex-col gap-4 px-5 py-4">
        <section className="flex flex-col items-center gap-2 rounded-[20px] bg-brand-surface px-5 py-6 text-center text-white">
          <Gift className="size-9" aria-hidden />
          <h2 className="text-xl font-bold">Invite a friend, both get a streak freeze</h2>
          <p className="text-sm text-white/85">A freeze keeps your SIP streak alive if you skip a month. Rewards are never cash.</p>
          <span data-testid="my-code" className="mt-2 rounded-xl bg-card px-4 py-2 font-mono text-2xl font-bold tracking-[0.12em] text-groww">{code}</span>
        </section>

        <div className="flex items-center gap-2 rounded-[14px] border border-line px-3 py-2.5">
          <span className="flex-1 truncate text-sm text-muted-ink">{link}</span>
          <button type="button" onClick={copy} className="flex h-9 items-center gap-1 rounded-lg bg-mint px-3 text-sm font-semibold text-groww">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button type="button" onClick={share} className="flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-brand-surface text-base font-bold text-white">
          <Share2 className="size-[18px]" aria-hidden />Share invite
        </button>

        <section className="flex items-center gap-3 rounded-2xl bg-info p-4">
          <Snowflake className="size-7 text-info-ink" aria-hidden />
          <div className="flex flex-col">
            <b data-testid="freeze-total" className="text-base">{freezes} streak freeze{freezes === 1 ? "" : "s"}</b>
            <span className="text-xs text-ink-2">1 for everyone + 1 per friend who joins + 1 if you joined via an invite (up to {MAX_REFERRAL_FREEZES} from invites)</span>
          </div>
        </section>

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Friends who joined ({referrals.length})</h2>
          {referrals.length === 0 && <p className="py-1 text-sm text-muted-ink">No one yet. Share your link to get started.</p>}
          {referrals.map((r, i) => (
            <div key={r.name} data-testid="friend-row" className="flex min-h-12 items-center justify-between border-b border-line-soft text-sm">
              <span className="flex items-center gap-2"><UserPlus className="size-4 text-groww" aria-hidden />{r.name}</span>
              <span className="text-muted-ink">{formatDate(r.joinedAt)} · {earned(i) ? "+1 freeze" : "limit reached"}</span>
            </div>
          ))}
          {capped && <p className="mt-2 text-xs text-muted-ink">You&apos;ve reached the invite reward limit. Thanks for spreading the habit!</p>}
        </section>

      </div>
    </>
  );
}
