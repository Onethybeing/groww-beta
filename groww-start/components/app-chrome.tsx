"use client";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { DemoPanel } from "./demo-panel";
import { MilestoneToast } from "./milestone-toast";
import { TabBar, TAB_PATHS } from "./tab-bar";
import { useHydrated } from "@/lib/store/use-hydrated";
import { useUi } from "@/lib/store/ui";
import { usePrefs, useThemeSync } from "@/lib/store/prefs";
import { useApp } from "@/lib/store";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  useThemeSync();
  const pathname = usePathname();
  const demoOpen = useUi((s) => s.demoOpen);
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const showTabs = TAB_PATHS.includes(pathname);

  // Pages built from saved data wrap themselves in <SavedData>; the rest render straight from the server.
  // Before the first paint after hydration, so saved data replaces defaults without a visible flash
  useLayoutEffect(() => {
    void useApp.persist.rehydrate();
    void usePrefs.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") setDemoOpen(true);
  }, [setDemoOpen]);

  return (
    <>
      <div className={showTabs ? "pb-24" : ""}>
        {children}
      </div>
      {hydrated && <MilestoneToast />}
      {showTabs && <TabBar />}
      {demoOpen && <DemoPanel />}
    </>
  );
}
