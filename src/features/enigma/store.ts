import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./config";
import { MODAL_CLOSE_MS } from "../../timings";
import type { EnigmaPersistedStatus } from "./types";

type EnigmaId = string;
type EnigmaState = { unlocked: boolean; solved: boolean };

type EnigmaStore = {
  enigmas: Record<EnigmaId, EnigmaState>;
  readLetters: Record<EnigmaId, boolean>;

  // UI éphémère
  newlyUnlocked: Set<EnigmaId>;
  modalEnigmaId: EnigmaId | null;
  modalClosingId: EnigmaId | null;
  celebrateCardId: EnigmaId | null;
  unlockingCardId: EnigmaId | null;
  unlockingTitle: string | null;
  successBoxNumber: number | null;
  successHaEvent: string | null;
  successEnigmaId: EnigmaId | null;
  loveLetterEnigmaId: EnigmaId | null;

  unlock: (id: EnigmaId) => void;
  solve: (id: EnigmaId) => void;
  relock: (id: EnigmaId) => void;
  setEnigmaStatus: (id: EnigmaId, status: EnigmaPersistedStatus) => void;
  acknowledgeUnlock: (id: EnigmaId) => void;
  openModal: (id: EnigmaId) => void;
  closeModal: () => void;
  celebrate: (id: EnigmaId) => void;
  clearCelebrate: () => void;
  startUnlocking: (id: EnigmaId, title: string) => void;
  clearUnlocking: () => void;
  showSuccessBox: (boxNumber: number, haEvent: string, enigmaId: EnigmaId) => void;
  hideSuccessBox: () => void;
  openLoveLetter: (id: EnigmaId) => void;
  closeLoveLetter: () => void;
};

const initialEnigmas: Record<EnigmaId, EnigmaState> = {};
ENIGMAS.forEach((e) => {
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
          if (s.enigmas[id]?.unlocked || s.enigmas[id]?.solved) return s;
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
            case "locked":
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: false, solved: false } },
                readLetters: { ...s.readLetters, [id]: false },
              };
            case "unlocked":
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: false } },
                readLetters: { ...s.readLetters, [id]: false },
              };
            case "solved":
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: true } },
              };
            case "completed":
              return {
                enigmas: { ...s.enigmas, [id]: { unlocked: true, solved: true } },
                readLetters: { ...s.readLetters, [id]: true },
              };
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
