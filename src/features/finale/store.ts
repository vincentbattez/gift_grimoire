import { create } from "zustand";
import { persist } from "zustand/middleware";

type FinaleStore = {
  finaleDone: boolean;
  finaleNarrative: boolean;
  finaleActive: boolean;
  finaleModalOpen: boolean;

  startNarrative: () => void;
  startFinale: () => void;
  openFinaleModal: () => void;
  closeFinaleModal: () => void;
};

export const useFinaleStore = create<FinaleStore>()(
  persist(
    (set) => ({
      finaleDone: false,
      finaleNarrative: false,
      finaleActive: false,
      finaleModalOpen: false,

      startNarrative: () => set({ finaleNarrative: true }),
      startFinale: () => set({ finaleActive: true }),
      openFinaleModal: () => set({ finaleNarrative: false, finaleModalOpen: true }),
      closeFinaleModal: () => set({ finaleActive: false, finaleModalOpen: false, finaleDone: true }),
    }),
    {
      name: "grimoire_finale",
      partialize: (s) => ({ finaleDone: s.finaleDone }),
    },
  ),
);
