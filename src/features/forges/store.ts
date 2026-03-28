import { create } from "zustand";
import { persist } from "zustand/middleware";

type ForgeStore = {
  forges: Record<string, boolean>;
  forgeRevealed: Record<string, boolean>;
  audioWarningAcknowledged: boolean;

  solveForge: (key: string) => void;
  resetForge: (key: string) => void;
  revealForge: (key: string) => void;
  acknowledgeAudioWarning: () => void;
};

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set) => ({
      forges: {},
      forgeRevealed: {},
      audioWarningAcknowledged: false,

      solveForge: (key) =>
        set((s) => ({ forges: { ...s.forges, [key]: true } })),
      resetForge: (key) =>
        set((s) => ({ forges: { ...s.forges, [key]: false } })),
      revealForge: (key) =>
        set((s) => ({ forgeRevealed: { ...s.forgeRevealed, [key]: true } })),
      acknowledgeAudioWarning: () => set({ audioWarningAcknowledged: true }),
    }),
    {
      name: "grimoire_forge",
      partialize: (s) => ({
        forges: s.forges,
        forgeRevealed: s.forgeRevealed,
        audioWarningAcknowledged: s.audioWarningAcknowledged,
      }),
    },
  ),
);
