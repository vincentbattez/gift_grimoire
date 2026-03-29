import { create } from "zustand";
import { persist } from "zustand/middleware";

type InkGameState = {
  revealedCellList: string[];
  missedCellList: string[];
  wordStates: Record<string, { solved: boolean; guessesLeft: number }>;
  dropsLeft: number;
  /** Date du jour (YYYY-MM-DD) où l'état a été sauvegardé — sert au reset quotidien */
  dayStamp: string;
};

type InkStore = {
  solved: boolean;
  revealed: boolean;
  inkGameState: InkGameState | null;
  dropResetCounter: number;
  setInkGameState: (state: InkGameState) => void;
  solve: () => void;
  reveal: () => void;
  resetInkGame: () => void;
  resetInkDrops: () => void;
  reset: () => void;
};

export const useInkStore = create<InkStore>()(
  persist(
    (set) => ({
      solved: false,
      revealed: false,
      inkGameState: null,
      dropResetCounter: 0,
      setInkGameState: (state) => set({ inkGameState: state }),
      solve: () => set({ solved: true }),
      reveal: () => set({ revealed: true }),
      resetInkGame: () => set({ inkGameState: null }),
      resetInkDrops: () => set((s) => ({ dropResetCounter: s.dropResetCounter + 1 })),
      reset: () => set({ solved: false, revealed: false, inkGameState: null }),
    }),
    {
      name: "grimoire_forge_ink",
      partialize: (s) => ({
        solved: s.solved,
        revealed: s.revealed,
        inkGameState: s.inkGameState,
      }),
    },
  ),
);
