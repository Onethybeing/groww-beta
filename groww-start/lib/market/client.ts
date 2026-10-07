"use client";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { HistoryResult, PricePoint, Quote } from "@/lib/types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useHistory(symbol: string) {
  return useQuery({
    queryKey: ["history", symbol],
    queryFn: () => getJSON<HistoryResult>(`/api/history?symbol=${encodeURIComponent(symbol)}`),
    staleTime: 15 * 60_000,
  });
}

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: async () => (await getJSON<{ quotes: Quote[] }>(`/api/quote?symbols=${symbols.map(encodeURIComponent).join(",")}`)).quotes,
    staleTime: 15 * 60_000,
    enabled: symbols.length > 0,
  });
}

/** Histories for several symbols at once, as { symbol: points } (empty array while loading). */
export function useHistories(symbols: string[]): Record<string, PricePoint[]> {
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["history", symbol],
      queryFn: () => getJSON<HistoryResult>(`/api/history?symbol=${encodeURIComponent(symbol)}`),
      staleTime: 15 * 60_000,
    })),
    combine: (results) => Object.fromEntries(results.map((r, i) => [symbols[i], r.data?.points ?? []])),
  });
}
