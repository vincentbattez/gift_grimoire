import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ENIGMAS } from "./config";
import { MODAL_CLOSE_MS } from "./timings";

type EnigmaId = string;
type EnigmaState = { unlocked: boolean; solved: boolean };

type GrimoireStore = {
  enigmas: Record<EnigmaId, EnigmaState>;
  lastAttempt: number | null;
  darkVadorPlayedAt: number | null;
  audioPlayCounts: Record<string, number>;
  toastMessage: string | null;
  modalEnigmaId: EnigmaId | null;
  modalClosingId: EnigmaId | null;
  newlyUnlocked: Set<EnigmaId>;
  celebrateCardId: EnigmaId | null;
  unlockingCardId: EnigmaId | null;
  unlockingTitle: string | null;
  scrambleSolved: boolean;
  magnetSolved: boolean;
  vibrationSolved: boolean;
  successBoxNumber: number | null;
  successHaEvent: string | null;
  successEnigmaId: EnigmaId | null;
  loveLetterEnigmaId: EnigmaId | null;
  audioWarningAcknowledged: boolean;
  forgeRevealed: Record<string, boolean>;
  readLetters: Record<EnigmaId, boolean>;

  unlock: (id: EnigmaId) => void;
  solve: (id: EnigmaId) => void;
  relock: (id: EnigmaId) => void;
  recordAttempt: () => void;
  resetAttempt: () => void;
  recordDarkVadorPlay: () => void;
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
  solveScramble: () => void;
  solveMagnet: () => void;
  solveVibration: () => void;
  resetScramble: () => void;
  resetMagnet: () => void;
  resetVibration: () => void;
  showSuccessBox: (boxNumber: number, haEvent: string, enigmaId: EnigmaId) => void;
  hideSuccessBox: () => void;
  openLoveLetter: (id: EnigmaId) => void;
  closeLoveLetter: () => void;
  acknowledgeAudioWarning: () => void;
  revealForge: (key: string) => void;
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
      darkVadorPlayedAt: null,
      audioPlayCounts: {},
      toastMessage: null,
      modalEnigmaId: null,
      modalClosingId: null,
      newlyUnlocked: new Set(),
      celebrateCardId: null,
      unlockingCardId: null,
      unlockingTitle: null,
      scrambleSolved: false,
      magnetSolved: false,
      vibrationSolved: false,
      successBoxNumber: null,
      successHaEvent: null,
      successEnigmaId: null,
      loveLetterEnigmaId: null,
      audioWarningAcknowledged: false,
      forgeRevealed: {},
      readLetters: {},

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

      relock: (id) =>
        set((s) => {
          const next = new Set(s.newlyUnlocked);
          next.delete(id);
          return {
            enigmas: {
              ...s.enigmas,
              [id]: { unlocked: false, solved: false },
            },
            newlyUnlocked: next,
          };
        }),

      recordAttempt: () => set({ lastAttempt: Date.now() }),
      resetAttempt: () => set({ lastAttempt: null, darkVadorPlayedAt: null, audioPlayCounts: {} }),
      recordDarkVadorPlay: () => set({ darkVadorPlayedAt: Date.now() }),
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
      solveScramble: () => set({ scrambleSolved: true }),
      solveMagnet: () => set({ magnetSolved: true }),
      solveVibration: () => set({ vibrationSolved: true }),
      resetScramble: () => set({ scrambleSolved: false }),
      resetMagnet: () => set({ magnetSolved: false }),
      resetVibration: () => set({ vibrationSolved: false }),
      showSuccessBox: (boxNumber, haEvent, enigmaId) => set({ successBoxNumber: boxNumber, successHaEvent: haEvent, successEnigmaId: enigmaId }),
      hideSuccessBox: () => {
        const enigmaId = get().successEnigmaId;
        if (enigmaId) {
          set((s) => ({
            successBoxNumber: null,
            successHaEvent: null,
            successEnigmaId: null,
            enigmas: {
              ...s.enigmas,
              [enigmaId]: { ...s.enigmas[enigmaId], solved: true },
            },
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
        set((s) => ({
          forgeRevealed: { ...s.forgeRevealed, [key]: true },
        })),
    }),
    {
      name: "grimoire_v3",
      partialize: (s) => ({ enigmas: s.enigmas, lastAttempt: s.lastAttempt, darkVadorPlayedAt: s.darkVadorPlayedAt, audioPlayCounts: s.audioPlayCounts, scrambleSolved: s.scrambleSolved, magnetSolved: s.magnetSolved, vibrationSolved: s.vibrationSolved, audioWarningAcknowledged: s.audioWarningAcknowledged, forgeRevealed: s.forgeRevealed, readLetters: s.readLetters }),
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
