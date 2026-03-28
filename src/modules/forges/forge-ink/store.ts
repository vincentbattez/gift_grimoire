import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InkGameState = {
  revealedCells: string[];
  missedCells: string[];
  wordStates: Record<string, { solved: boolean; guessesLeft: number }>;
  dropsLeft: number;
  /** Date du jour (YYYY-MM-DD) où l'état a été sauvegardé — sert au reset quotidien */
  dayStamp: string;
};

type InkStore = {
  inkGameState: InkGameState | null;
  dropResetCounter: number;
  setInkGameState: (state: InkGameState) => void;
  resetInkGame: () => void;
  resetInkDrops: () => void;
};

export const useInkStore = create<InkStore>()(
  persist(
    (set) => ({
      inkGameState: null,
      dropResetCounter: 0,
      setInkGameState: (state) => set({ inkGameState: state }),
      resetInkGame: () => set({ inkGameState: null }),
      resetInkDrops: () => set((s) => ({ dropResetCounter: s.dropResetCounter + 1 })),
    }),
    { name: "grimoire_forge_ink" },
  ),
);
