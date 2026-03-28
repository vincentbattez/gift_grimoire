import { create } from "zustand";
import { persist } from "zustand/middleware";

type ForgeStore = {
  audioWarningAcknowledged: boolean;
  acknowledgeAudioWarning: () => void;
};

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set) => ({
      audioWarningAcknowledged: false,
      acknowledgeAudioWarning: () => set({ audioWarningAcknowledged: true }),
    }),
    {
      name: "grimoire_forge",
      partialize: (s) => ({
        audioWarningAcknowledged: s.audioWarningAcknowledged,
      }),
    },
  ),
);
