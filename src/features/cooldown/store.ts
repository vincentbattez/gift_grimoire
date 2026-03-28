import { create } from "zustand";
import { persist } from "zustand/middleware";

type CooldownStore = {
  lastAttempt: number | null;
  audioPlayCounts: Record<string, number>;

  recordAttempt: () => void;
  resetAttempt: () => void;
  incrementAudioPlay: (key: string) => void;
};

export const useCooldownStore = create<CooldownStore>()(
  persist(
    (set) => ({
      lastAttempt: null,
      audioPlayCounts: {},

      recordAttempt: () => set({ lastAttempt: Date.now() }),
      resetAttempt: () => set({ lastAttempt: null, audioPlayCounts: {} }),
      incrementAudioPlay: (key) =>
        set((s) => ({
          audioPlayCounts: { ...s.audioPlayCounts, [key]: (s.audioPlayCounts[key] ?? 0) + 1 },
        })),
    }),
    {
      name: "grimoire_cooldown",
      partialize: (s) => ({
        lastAttempt: s.lastAttempt,
        audioPlayCounts: s.audioPlayCounts,
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
