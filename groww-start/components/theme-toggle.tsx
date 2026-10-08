"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import type { ThemePref } from "@/lib/theme";

const NEXT: Record<ThemePref, ThemePref> = { system: "light", light: "dark", dark: "system" };
const ICON = { system: Monitor, light: Sun, dark: Moon };

/** Cycles System → Light → Dark. */
export function ThemeToggle() {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);
  const Icon = ICON[theme];
  return (
    <button type="button" onClick={() => setTheme(NEXT[theme])} aria-label={`Theme: ${theme}`} data-testid="theme-toggle"
      className="flex size-11 items-center justify-center rounded-xl text-ink">
      <Icon className="size-[20px]" aria-hidden />
    </button>
  );
}
