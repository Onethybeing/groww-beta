"use client";
import { useHydrated } from "@/lib/store/use-hydrated";

/** Renders children only once the user's saved data has loaded (for screens built from it). */
export function SavedData({ children, fallback = <div className="p-6 text-sm text-muted-ink">Loading…</div> }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return useHydrated() ? <>{children}</> : <>{fallback}</>;
}
