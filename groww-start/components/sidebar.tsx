"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GrowLogo } from "@/components/brand/grow-logo";
import { TABS } from "./tab-bar";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/** Desktop navigation: the same destinations as the phone tab bar. */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-1 border-r border-line bg-card px-4 py-6 lg:flex">
      <Link href="/" className="mb-6 px-2" aria-label="GROW Beta home"><GrowLogo /></Link>
      {TABS.map(({ href, label, Icon, isNew }) => {
        const active = isActive(pathname, href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] ${active ? "bg-mint font-bold text-groww" : "font-medium text-ink-2 hover:bg-surface"}`}>
            <Icon className="size-5" aria-hidden />
            {label}
            {isNew && !active && <span className="ml-auto rounded-full bg-brand-surface px-1.5 text-[10px] font-bold leading-4 text-white">NEW</span>}
          </Link>
        );
      })}
    </nav>
  );
}
