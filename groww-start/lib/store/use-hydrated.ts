"use client";
import { useSyncExternalStore } from "react";
import { useApp } from "./index";

/** True once the persisted store has rehydrated from browser storage (always false on the server). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useApp.persist.onFinishHydration(onChange),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}
