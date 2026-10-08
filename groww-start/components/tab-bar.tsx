"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FlaskConical, Home, Layers, TrendingUp } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/stocks", label: "Stocks", Icon: TrendingUp },
  { href: "/funds", label: "Mutual Funds", Icon: Layers },
  { href: "/practice", label: "Practice", Icon: FlaskConical, isNew: true },
  { href: "/holdings", label: "Holdings", Icon: Briefcase },
];

/** Tab bar shows on these top-level screens; detail/order screens have their own footers. */
export const TAB_PATHS = TABS.map((t) => t.href);

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-[430px] grid-cols-5 border-t border-line bg-card px-1 pb-3.5 pt-2">
      {TABS.map(({ href, label, Icon, isNew }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 flex-col items-center gap-1 text-[11px] ${active ? "font-bold text-groww" : "font-medium text-muted-ink"}`}>
            {isNew && !active && <span className="absolute -top-0.5 right-3 rounded-full bg-brand-surface px-1.5 text-[9px] font-bold leading-[14px] text-white">NEW</span>}
            <Icon className="size-[22px]" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
