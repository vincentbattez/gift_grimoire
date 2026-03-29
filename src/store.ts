import { create } from "zustand";

type UIStore = {
  toastMessage: string | null;
  showToast: (toastMessage: string) => void;
  hideToast: () => void;
};

export const useUIStore = create<UIStore>()((set) => ({
  toastMessage: null,
  showToast: (toastMessage) => {
    set({ toastMessage: toastMessage });
  },
  hideToast: () => {
    set({ toastMessage: null });
  },
}));
