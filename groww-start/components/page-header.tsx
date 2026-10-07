import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";

export function PageHeader({ title, back, close, right }: { title?: React.ReactNode; back?: string; close?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-center gap-2 border-b border-line px-4 py-3.5">
      {back && (
        <Link href={back} aria-label="Back" className="flex size-11 items-center justify-center rounded-xl text-ink">
          <ChevronLeft className="size-[22px]" aria-hidden />
        </Link>
      )}
      {close && (
        <Link href={close} aria-label="Close" className="flex size-11 items-center justify-center rounded-xl text-ink">
          <X className="size-[22px]" aria-hidden />
        </Link>
      )}
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}
