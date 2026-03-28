import { create } from "zustand";

type UIStore = {
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
};

export const useUIStore = create<UIStore>()((set) => ({
  toastMessage: null,
  showToast: (msg) => set({ toastMessage: msg }),
  hideToast: () => set({ toastMessage: null }),
}));

/** Returns ms until midnight (next attempt) */
export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
