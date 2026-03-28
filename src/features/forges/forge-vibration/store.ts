import { create } from "zustand";
import { persist } from "zustand/middleware";

type VibrationStore = {
  solved: boolean;
  revealed: boolean;
  solve: () => void;
  reveal: () => void;
  reset: () => void;
};

export const useVibrationStore = create<VibrationStore>()(
  persist(
    (set) => ({
      solved: false,
      revealed: false,
      solve: () => set({ solved: true }),
      reveal: () => set({ revealed: true }),
      reset: () => set({ solved: false, revealed: false }),
    }),
    {
      name: "grimoire_forge_vibration",
    },
  ),
);
