"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useSyncExternalStore } from "react";
import { resolveTheme, type ThemePref } from "@/lib/theme";

export type Lang = "en" | "hi";

interface Prefs {
  theme: ThemePref;
  lang: Lang;
  /** Random, anonymous id used only for aggregate analytics. */
  anonId: string;
  setTheme(t: ThemePref): void;
  setLang(l: Lang): void;
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `a-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** UI preferences (theme, language, anonymous id), kept apart from the app data store. */
export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      theme: "system",
      lang: "en",
      anonId: newId(),
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
    }),
    { name: "grow-ui", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

const mq = () => (typeof window === "undefined" ? null : window.matchMedia("(prefers-color-scheme: dark)"));

/** The effective theme; keeps the `dark` class on <html> in sync with the preference and the OS setting. */
export function useResolvedTheme(): "light" | "dark" {
  const pref = usePrefs((s) => s.theme);
  const prefersDark = useSyncExternalStore(
    (cb) => {
      const m = mq();
      m?.addEventListener("change", cb);
      return () => m?.removeEventListener("change", cb);
    },
    () => mq()?.matches ?? false,
    () => false,
  );
  const resolved = resolveTheme(pref, prefersDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);
  return resolved;
}
