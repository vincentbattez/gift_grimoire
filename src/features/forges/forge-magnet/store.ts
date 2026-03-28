import { create } from "zustand";
import { persist } from "zustand/middleware";

type MagnetStore = {
  solved: boolean;
  revealed: boolean;
  darkVadorPlayedAt: number | null;
  recordDarkVadorPlay: () => void;
  solve: () => void;
  reveal: () => void;
  reset: () => void;
};

export const useMagnetStore = create<MagnetStore>()(
  persist(
    (set) => ({
      solved: false,
      revealed: false,
      darkVadorPlayedAt: null,
      recordDarkVadorPlay: () => set({ darkVadorPlayedAt: Date.now() }),
      solve: () => set({ solved: true }),
      reveal: () => set({ revealed: true }),
      reset: () => set({ darkVadorPlayedAt: null, solved: false, revealed: false }),
    }),
    {
      name: "grimoire_forge_magnet",
      partialize: (s) => ({
        solved: s.solved,
        revealed: s.revealed,
        darkVadorPlayedAt: s.darkVadorPlayedAt,
      }),
    },
  ),
);
