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

/** Pages that are mostly the user's own saved data wait for it; everything else renders straight from the server. */
const NEEDS_SAVED_DATA = [/^\/holdings/, /^\/practice$/, /^\/orders/, /^\/sips\//, /^\/refer/, /^\/r\//, /^\/quests/, /^\/funds\/[^/]+\/sip/];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  useThemeSync();
  const pathname = usePathname();
  const demoOpen = useUi((s) => s.demoOpen);
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const showTabs = TAB_PATHS.includes(pathname);
  const gated = NEEDS_SAVED_DATA.some((re) => re.test(pathname));

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
        {hydrated || !gated ? children : <div className="p-6 text-sm text-muted-ink">Loading…</div>}
      </div>
      {hydrated && <MilestoneToast />}
      {showTabs && <TabBar />}
      {demoOpen && <DemoPanel />}
    </>
  );
}
