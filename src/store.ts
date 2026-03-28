import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./features/enigma/config";
import { MODAL_CLOSE_MS } from "./timings";
import type { EnigmaPersistedStatus } from "./features/enigma/types";

type EnigmaId = string;
type EnigmaState = { unlocked: boolean; solved: boolean };

type GrimoireStore = {
  enigmas: Record<EnigmaId, EnigmaState>;
  lastAttempt: number | null;
  audioPlayCounts: Record<string, number>;
  toastMessage: string | null;
  modalEnigmaId: EnigmaId | null;
  modalClosingId: EnigmaId | null;
  newlyUnlocked: Set<EnigmaId>;
  celebrateCardId: EnigmaId | null;
  unlockingCardId: EnigmaId | null;
  unlockingTitle: string | null;
  /** État de complétion des forges — clé = ForgeModule.key */
  forges: Record<string, boolean>;
  successBoxNumber: number | null;
  successHaEvent: string | null;
  successEnigmaId: EnigmaId | null;
  loveLetterEnigmaId: EnigmaId | null;
  audioWarningAcknowledged: boolean;
  forgeRevealed: Record<string, boolean>;
  readLetters: Record<EnigmaId, boolean>;
  finaleDone: boolean;
  finaleNarrative: boolean;
  finaleActive: boolean;
  finaleModalOpen: boolean;

  unlock: (id: EnigmaId) => void;
  solve: (id: EnigmaId) => void;
  relock: (id: EnigmaId) => void;
  recordAttempt: () => void;
  resetAttempt: () => void;
  incrementAudioPlay: (key: string) => void;
  acknowledgeUnlock: (id: EnigmaId) => void;
  openModal: (id: EnigmaId) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
  celebrate: (id: EnigmaId) => void;
  clearCelebrate: () => void;
  startUnlocking: (id: EnigmaId, title: string) => void;
  clearUnlocking: () => void;
  /** Admin: force l'état persisté d'une énigme */
  setEnigmaStatus: (id: EnigmaId, status: EnigmaPersistedStatus) => void;
  solveForge: (key: string) => void;
  resetForge: (key: string) => void;
  showSuccessBox: (boxNumber: number, haEvent: string, enigmaId: EnigmaId) => void;
  hideSuccessBox: () => void;
  openLoveLetter: (id: EnigmaId) => void;
  closeLoveLetter: () => void;
  acknowledgeAudioWarning: () => void;
  revealForge: (key: string) => void;
  startNarrative: () => void;
  startFinale: () => void;
  openFinaleModal: () => void;
  closeFinaleModal: () => void;
};

const initialEnigmas: Record<EnigmaId, EnigmaState> = {};
ENIGMAS.forEach((e) => {
  initialEnigmas[e.id] = { unlocked: false, solved: false };
});

export const useStore = create<GrimoireStore>()(
  persist(
    (set, get) => ({
      enigmas: initialEnigmas,
      lastAttempt: null,
      audioPlayCounts: {},
      toastMessage: null,
      modalEnigmaId: null,
      modalClosingId: null,
      newlyUnlocked: new Set(),
      celebrateCardId: null,
      unlockingCardId: null,
      unlockingTitle: null,
      forges: {},
      successBoxNumber: null,
      successHaEvent: null,
      successEnigmaId: null,
      loveLetterEnigmaId: null,
      audioWarningAcknowledged: false,
      forgeRevealed: {},
      readLetters: {},
      finaleDone: false,
      finaleNarrative: false,
      finaleActive: false,
      finaleModalOpen: false,

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

      recordAttempt: () => set({ lastAttempt: Date.now() }),
      resetAttempt: () => set({ lastAttempt: null, audioPlayCounts: {} }),
      incrementAudioPlay: (key) =>
        set((s) => ({
          audioPlayCounts: { ...s.audioPlayCounts, [key]: (s.audioPlayCounts[key] ?? 0) + 1 },
        })),

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
      showToast: (msg) => set({ toastMessage: msg }),
      hideToast: () => set({ toastMessage: null }),
      celebrate: (id) => set({ celebrateCardId: id }),
      clearCelebrate: () => set({ celebrateCardId: null }),
      startUnlocking: (id, title) => set({ unlockingCardId: id, unlockingTitle: title }),
      clearUnlocking: () => set({ unlockingCardId: null, unlockingTitle: null }),

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

      solveForge: (key) =>
        set((s) => ({ forges: { ...s.forges, [key]: true } })),
      resetForge: (key) =>
        set((s) => ({ forges: { ...s.forges, [key]: false } })),

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
      acknowledgeAudioWarning: () => set({ audioWarningAcknowledged: true }),
      revealForge: (key) =>
        set((s) => ({ forgeRevealed: { ...s.forgeRevealed, [key]: true } })),
      startNarrative: () => set({ finaleNarrative: true }),
      startFinale: () => set({ finaleActive: true }),
      openFinaleModal: () => set({ finaleNarrative: false, finaleModalOpen: true }),
      closeFinaleModal: () => set({ finaleActive: false, finaleModalOpen: false, finaleDone: true }),
    }),
    {
      name: "grimoire_v3",
      partialize: (s) => ({
        enigmas: s.enigmas,
        lastAttempt: s.lastAttempt,
        audioPlayCounts: s.audioPlayCounts,
        forges: s.forges,
        audioWarningAcknowledged: s.audioWarningAcknowledged,
        forgeRevealed: s.forgeRevealed,
        readLetters: s.readLetters,
        finaleDone: s.finaleDone,
      }),
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
