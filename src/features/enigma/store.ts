import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMA_LIST } from "./config";
import { MODAL_CLOSE_MS } from "./timings";
import type { EnigmaPersistedStatus } from "./types";

type EnigmaState = { unlocked: boolean; solved: boolean };

type EnigmaStore = {
  enigmas: Record<string, EnigmaState>;
  readLetters: Record<string, boolean>;

  // UI éphémère
  newlyUnlocked: Set<string>;
  modalEnigmaId: string | null;
  modalClosingId: string | null;
  celebrateCardId: string | null;
  unlockingCardId: string | null;
  unlockingTitle: string | null;
  successBoxNumber: number | null;
  successHaEvent: string | null;
  successEnigmaId: string | null;
  loveLetterEnigmaId: string | null;

  unlock: (id: string) => void;
  solve: (id: string) => void;
  relock: (id: string) => void;
  setEnigmaStatus: (id: string, status: EnigmaPersistedStatus) => void;
  acknowledgeUnlock: (id: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  celebrate: (id: string) => void;
  clearCelebrate: () => void;
  startUnlocking: (id: string, title: string) => void;
  clearUnlocking: () => void;
  showSuccessBox: (boxNumber: number, haEvent: string, enigmaId: string) => void;
  hideSuccessBox: () => void;
  openLoveLetter: (id: string) => void;
  closeLoveLetter: () => void;
};

const initialEnigmas: Record<string, EnigmaState> = {};

ENIGMA_LIST.forEach((e) => {
  initialEnigmas[e.id] = { unlocked: false, solved: false };
});

export const useEnigmaStore = create<EnigmaStore>()(
  persist(
    (set, get) => ({
      enigmas: initialEnigmas,
      readLetters: {},
      newlyUnlocked: new Set(),
      modalEnigmaId: null,
      modalClosingId: null,
      celebrateCardId: null,
      unlockingCardId: null,
      unlockingTitle: null,
      successBoxNumber: null,
      successHaEvent: null,
      successEnigmaId: null,
      loveLetterEnigmaId: null,

      unlock: (id) =>
        set((s) => {
          if (s.enigmas[id].unlocked || s.enigmas[id].solved) {
            return s;
          }
          const next = new Set(s.newlyUnlocked);
          next.add(id);

          return {
            enigmas: { ...s.enigmas, [id]: { ...s.enigmas[id], unlocked: true } },
            newlyUnlocked: next,
          };
        }),

      solve: (id) =>
        set((s) => ({
          enigmas: { ...s.enigmas, [id]: { ...s.enigmas[id], solved: true } },
        })),

      relock: (id) =>
        set((s) => {
          const next = new Set(s.newlyUnlocked);
          next.delete(id);

          return {
            enigmas: { ...s.enigmas, [id]: { unlocked: false, solved: false } },
            newlyUnlocked: next,
          };
        }),

      setEnigmaStatus: (id, status) =>
        set((s) => {
          switch (status) {
            case "locked": {
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: false, solved: false } },
                readLetters: { ...s.readLetters, [id]: false },
              };
            }
            case "unlocked": {
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: false } },
                readLetters: { ...s.readLetters, [id]: false },
              };
            }
            case "solved": {
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: true } },
              };
            }
            case "completed": {
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: true } },
                readLetters: { ...s.readLetters, [id]: true },
              };
            }
            default: {
              return status satisfies never;
            }
          }
        }),

      acknowledgeUnlock: (id) =>
        set((s) => {
          const next = new Set(s.newlyUnlocked);
          next.delete(id);

          return { newlyUnlocked: next };
        }),

      openModal: (id) => set({ modalEnigmaId: id, modalClosingId: null }),
      closeModal: () => {
        const closingId = get().modalEnigmaId;
        set({ modalEnigmaId: null, modalClosingId: closingId });
        setTimeout(() => set({ modalClosingId: null }), MODAL_CLOSE_MS);
      },

      celebrate: (id) => set({ celebrateCardId: id }),
      clearCelebrate: () => set({ celebrateCardId: null }),
      startUnlocking: (id, title) => set({ unlockingCardId: id, unlockingTitle: title }),
      clearUnlocking: () => set({ unlockingCardId: null, unlockingTitle: null }),

      showSuccessBox: (boxNumber, haEvent, enigmaId) =>
        set({ successBoxNumber: boxNumber, successHaEvent: haEvent, successEnigmaId: enigmaId }),
      hideSuccessBox: () => {
        const enigmaId = get().successEnigmaId;

        if (enigmaId) {
          set((s) => ({
            successBoxNumber: null,
            successHaEvent: null,
            successEnigmaId: null,
            enigmas: { ...s.enigmas, [enigmaId]: { ...s.enigmas[enigmaId], solved: true } },
          }));
        } else {
          set({ successBoxNumber: null, successHaEvent: null, successEnigmaId: null });
        }
      },

      openLoveLetter: (id) => set({ loveLetterEnigmaId: id }),
      closeLoveLetter: () => {
        const id = get().loveLetterEnigmaId;
        const closingModalId = get().modalEnigmaId;

        set((s) => ({
          loveLetterEnigmaId: null,
          modalEnigmaId: null,
          ...(closingModalId ? { modalClosingId: closingModalId } : {}),
          ...(id ? { readLetters: { ...s.readLetters, [id]: true } } : {}),
        }));

        if (closingModalId) {
          setTimeout(() => set({ modalClosingId: null }), MODAL_CLOSE_MS);
        }
      },
    }),
    {
      name: "grimoire_enigma",
      partialize: (s) => ({
        enigmas: s.enigmas,
        readLetters: s.readLetters,
      }),
    },
  ),
);
