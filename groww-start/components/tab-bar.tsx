"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FlaskConical, Home, Sprout, Trophy } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/learn", label: "Learn", Icon: BookOpen },
  { href: "/practice", label: "Practice", Icon: FlaskConical },
  { href: "/invest", label: "Invest", Icon: Sprout },
  { href: "/progress", label: "Progress", Icon: Trophy },
];

export const TAB_PATHS = TABS.map((t) => t.href);

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-[430px] grid-cols-5 border-t border-line bg-white px-1 pb-3.5 pt-2">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center gap-1 text-[11px] ${active ? "font-bold text-groww" : "font-medium text-muted-ink"}`}>
            <Icon className="size-[22px]" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
