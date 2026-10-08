"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DemoPanel } from "./demo-panel";
import { MilestoneToast } from "./milestone-toast";
import { TabBar, TAB_PATHS } from "./tab-bar";
import { useHydrated } from "@/lib/store/use-hydrated";
import { useUi } from "@/lib/store/ui";
import { useThemeSync } from "@/lib/store/prefs";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  useThemeSync();
  const pathname = usePathname();
  const demoOpen = useUi((s) => s.demoOpen);
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const showTabs = TAB_PATHS.includes(pathname);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") setDemoOpen(true);
  }, [setDemoOpen]);

  return (
    <>
      <div className={showTabs ? "pb-24" : ""}>
        {hydrated ? children : <div className="p-6 text-sm text-muted-ink">Loading…</div>}
      </div>
      {hydrated && <MilestoneToast />}
      {showTabs && <TabBar />}
      {demoOpen && <DemoPanel />}
    </>
  );
}
