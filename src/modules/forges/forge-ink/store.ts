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
  setInkGameState: (state: InkGameState) => void;
  resetInkGame: () => void;
};

export const useInkStore = create<InkStore>()(
  persist(
    (set) => ({
      inkGameState: null,
      setInkGameState: (state) => set({ inkGameState: state }),
      resetInkGame: () => set({ inkGameState: null }),
    }),
    { name: "grimoire_forge_ink" },
  ),
);
