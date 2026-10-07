"use client";
import { useQuery } from "@tanstack/react-query";
import type { HistoryResult, Quote } from "@/lib/types";

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
