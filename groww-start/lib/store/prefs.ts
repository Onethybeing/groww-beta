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
  /** Writes the generated anon id to storage so it stays stable across reloads. */
  persistId(): void;
}

const mq = () => (typeof window === "undefined" ? null : window.matchMedia("(prefers-color-scheme: dark)"));
const THEME_COLOR = { light: "#0b7a55", dark: "#08090c" } as const;

/** Applies a theme preference to <html> right away (class, color-scheme, browser theme-color). */
export function applyTheme(pref: ThemePref): void {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(pref, mq()?.matches ?? false);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_COLOR[resolved]));
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `a-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** UI preferences (theme, language, anonymous id), kept apart from the app data store. */
export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      theme: "system",
      lang: "en",
      anonId: newId(),
      setTheme: (theme) => {
        applyTheme(theme); // before React re-renders, so charts read the new colours
        set({ theme });
      },
      setLang: (lang) => set({ lang }),
      persistId: () => set({ anonId: get().anonId }),
    }),
    {
      name: "grow-ui",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.persistId(),
    },
  ),
);

// Registered before any React subscription, so an OS theme change updates <html> before components re-render.
mq()?.addEventListener("change", () => applyTheme(usePrefs.getState().theme));

const subscribe = (cb: () => void) => {
  const m = mq();
  m?.addEventListener("change", cb);
  return () => m?.removeEventListener("change", cb);
};

/** Read-only: the effective theme (for components such as charts that need to re-render on change). */
export function useResolvedTheme(): "light" | "dark" {
  const pref = usePrefs((s) => s.theme);
  const prefersDark = useSyncExternalStore(subscribe, () => mq()?.matches ?? false, () => false);
  return resolveTheme(pref, prefersDark);
}

/**
 * Mount once (AppChrome): keeps the `dark` class and the browser theme-color in sync with the preference.
 * Reads matchMedia directly in the effect, so hydration never strips the class the boot script set.
 */
export function useThemeSync(): void {
  const pref = usePrefs((s) => s.theme);
  const prefersDark = useSyncExternalStore(subscribe, () => mq()?.matches ?? false, () => false);
  useEffect(() => applyTheme(pref), [pref, prefersDark]);
}
