"use client";
import { SavedData } from "@/components/saved-data";
import Link from "next/link";
import { useState } from "react";
import { Snowflake } from "lucide-react";
import { GrowLogo } from "@/components/brand/grow-logo";
import { useApp } from "@/lib/store";
import { isValidCode, normaliseCode } from "@/lib/engine/referrals";

/** Landing page for an invite link: accepting it gives the new user a bonus streak freeze. */
function InviteLandingBody({ code }: { code: string }) {
  const acceptReferral = useApp((s) => s.acceptReferral);
  const referredBy = useApp((s) => s.referredBy);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const valid = isValidCode(code);

  return (
    <div className="flex min-h-dvh flex-col gap-5 px-6 py-8">
      <GrowLogo />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-groww">You&apos;re invited</span>
        <h1 className="text-[26px] font-bold leading-[1.2]">A friend invited you to GROW Beta</h1>
        <p className="text-[15px] leading-[1.5] text-ink-2">
          Learn the basics in 2 minutes, practise with virtual money, then start a SIP from ₹100. Join with this invite and get a bonus streak freeze.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-info p-4">
        <Snowflake className="size-7 text-info-ink" aria-hidden />
        <span className="text-sm">Invite code <b className="font-mono tracking-[0.08em]">{normaliseCode(code)}</b></span>
      </div>
      {!valid ? (
        <p role="alert" className="text-sm font-semibold text-loss">This invite link isn&apos;t valid. You can still explore GROW Beta.</p>
      ) : referredBy && !result ? (
        <p className="text-sm text-muted-ink">You&apos;ve already joined with an invite ({referredBy}).</p>
      ) : !result ? (
        <button type="button" data-testid="accept-invite" onClick={() => {
          const r = acceptReferral(code);
          setResult(r.ok ? { ok: true, text: "Invite accepted: +1 streak freeze added." } : { ok: false, text: r.error });
        }} className="h-[52px] rounded-[14px] bg-brand-surface text-base font-bold text-white">Accept invite</button>
      ) : null}
      {result && <p role="status" className={`text-sm font-semibold ${result.ok ? "text-groww" : "text-loss"}`}>{result.text}</p>}
      <Link href="/" className="flex h-12 items-center justify-center rounded-[14px] border-[1.5px] border-line text-[15px] font-bold">Open GROW Beta</Link>
      <p className="mt-auto text-center text-[11px] text-muted-ink">Concept demo inspired by Groww · not affiliated · demo money only · rewards are never cash</p>
    </div>
  );
}

export function InviteLanding({ code }: { code: string }) {
  return <SavedData><InviteLandingBody code={code} /></SavedData>;
}
