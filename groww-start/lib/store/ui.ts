import { create } from "zustand";

/** Ephemeral UI state (not persisted). */
export const useUi = create<{ demoOpen: boolean; setDemoOpen: (open: boolean) => void }>()((set) => ({
  demoOpen: false,
  setDemoOpen: (demoOpen) => set({ demoOpen }),
}));
