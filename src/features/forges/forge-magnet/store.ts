import { create } from "zustand";
import { persist } from "zustand/middleware";

type MagnetStore = {
  darkVadorPlayedAt: number | null;
  recordDarkVadorPlay: () => void;
  reset: () => void;
};

export const useMagnetStore = create<MagnetStore>()(
  persist(
    (set) => ({
      darkVadorPlayedAt: null,
      recordDarkVadorPlay: () => set({ darkVadorPlayedAt: Date.now() }),
      reset: () => set({ darkVadorPlayedAt: null }),
    }),
    { name: "grimoire_forge_magnet" },
  ),
);
