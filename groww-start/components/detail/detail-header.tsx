import Link from "next/link";
import { Bookmark, ChevronLeft } from "lucide-react";

export function DetailHeader({ back }: { back: string }) {
  return (
    <header className="flex items-center justify-between px-3 py-2.5">
      <Link href={back} aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
      <button type="button" aria-label="Add to watchlist" className="flex size-11 items-center justify-center"><Bookmark className="size-[22px]" aria-hidden /></button>
    </header>
  );
}
