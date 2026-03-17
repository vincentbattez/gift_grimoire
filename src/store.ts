import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./config";

type EnigmaId = string;
type EnigmaState = { unlocked: boolean; solved: boolean };

type GrimoireStore = {
  enigmas: Record<EnigmaId, EnigmaState>;
  lastAttempt: number | null;
  toastMessage: string | null;
  modalEnigmaId: EnigmaId | null;
  newlyUnlocked: Set<EnigmaId>;
  celebrateCardId: EnigmaId | null;

  unlock: (id: EnigmaId) => void;
  solve: (id: EnigmaId) => void;
  recordAttempt: () => void;
  resetAttempt: () => void;
  acknowledgeUnlock: (id: EnigmaId) => void;
  openModal: (id: EnigmaId) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
  celebrate: (id: EnigmaId) => void;
  clearCelebrate: () => void;
};

const initialEnigmas: Record<EnigmaId, EnigmaState> = {};
ENIGMAS.forEach((e) => {
  initialEnigmas[e.id] = { unlocked: false, solved: false };
});

export const useStore = create<GrimoireStore>()(
  persist(
    (set) => ({
      enigmas: initialEnigmas,
      lastAttempt: null,
      toastMessage: null,
      modalEnigmaId: null,
      newlyUnlocked: new Set(),
      celebrateCardId: null,

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

      recordAttempt: () => set({ lastAttempt: Date.now() }),
      resetAttempt: () => set({ lastAttempt: null }),

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
      celebrate: (id) => set({ celebrateCardId: id }),
      clearCelebrate: () => set({ celebrateCardId: null }),
    }),
    {
      name: "grimoire_v3",
      partialize: (s) => ({ enigmas: s.enigmas, lastAttempt: s.lastAttempt }),
    },
  ),
);

/** Returns true if an attempt was already used today */
export function isAttemptUsedToday(lastAttempt: number | null): boolean {
  if (!lastAttempt) return false;
  const now = new Date();
  const last = new Date(lastAttempt);
  return (
    now.getFullYear() === last.getFullYear() &&
    now.getMonth() === last.getMonth() &&
    now.getDate() === last.getDate()
  );
}

/** Returns ms until midnight (next attempt) */
export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
