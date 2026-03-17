import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./config";

type EnigmaId = string;
type EnigmaState = { unlocked: boolean; solved: boolean };

type GrimoireStore = {
  enigmas: Record<EnigmaId, EnigmaState>;
  toastMessage: string | null;
  modalEnigmaId: EnigmaId | null;
  newlyUnlocked: Set<EnigmaId>;

  unlock: (id: EnigmaId) => void;
  solve: (id: EnigmaId) => void;
  acknowledgeUnlock: (id: EnigmaId) => void;
  openModal: (id: EnigmaId) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
};

const initialEnigmas: Record<EnigmaId, EnigmaState> = {};
ENIGMAS.forEach((e) => {
  initialEnigmas[e.id] = { unlocked: false, solved: false };
});

export const useStore = create<GrimoireStore>()(
  persist(
    (set) => ({
      enigmas: initialEnigmas,
      toastMessage: null,
      modalEnigmaId: null,
      newlyUnlocked: new Set(),

      unlock: (id) =>
        set((s) => {
          if (s.enigmas[id]?.unlocked || s.enigmas[id]?.solved) return s;
          const next = new Set(s.newlyUnlocked);
          next.add(id);
          return {
            enigmas: {
              ...s.enigmas,
              [id]: { ...s.enigmas[id], unlocked: true },
            },
            newlyUnlocked: next,
          };
        }),

      solve: (id) =>
        set((s) => ({
          enigmas: {
            ...s.enigmas,
            [id]: { ...s.enigmas[id], solved: true },
          },
        })),

      acknowledgeUnlock: (id) =>
        set((s) => {
          const next = new Set(s.newlyUnlocked);
          next.delete(id);
          return { newlyUnlocked: next };
        }),

      openModal: (id) => set({ modalEnigmaId: id }),
      closeModal: () => set({ modalEnigmaId: null }),
      showToast: (msg) => set({ toastMessage: msg }),
      hideToast: () => set({ toastMessage: null }),
    }),
    {
      name: "grimoire_v3",
      partialize: (s) => ({ enigmas: s.enigmas }),
    },
  ),
);

export const solvedCount = () =>
  Object.values(useStore.getState().enigmas).filter((e) => e.solved).length;
