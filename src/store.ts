import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./config";

type EnigmaState = { unlocked: boolean; solved: boolean };

type GrimoireStore = {
  enigmas: Record<number, EnigmaState>;
  toastMessage: string | null;
  modalEnigmaId: number | null;

  unlock: (id: number) => void;
  solve: (id: number) => void;
  openModal: (id: number) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
};

const initialEnigmas: Record<number, EnigmaState> = {};
ENIGMAS.forEach((e) => {
  initialEnigmas[e.id] = { unlocked: false, solved: false };
});

export const useStore = create<GrimoireStore>()(
  persist(
    (set) => ({
      enigmas: initialEnigmas,
      toastMessage: null,
      modalEnigmaId: null,

      unlock: (id) =>
        set((s) => {
          if (s.enigmas[id]?.unlocked || s.enigmas[id]?.solved) return s;
          return {
            enigmas: {
              ...s.enigmas,
              [id]: { ...s.enigmas[id], unlocked: true },
            },
          };
        }),

      solve: (id) =>
        set((s) => ({
          enigmas: {
            ...s.enigmas,
            [id]: { ...s.enigmas[id], solved: true },
          },
        })),

      openModal: (id) => set({ modalEnigmaId: id }),
      closeModal: () => set({ modalEnigmaId: null }),
      showToast: (msg) => set({ toastMessage: msg }),
      hideToast: () => set({ toastMessage: null }),
    }),
    {
      name: "grimoire_v2",
      partialize: (s) => ({ enigmas: s.enigmas }),
    },
  ),
);

export const solvedCount = () =>
  Object.values(useStore.getState().enigmas).filter((e) => e.solved).length;
