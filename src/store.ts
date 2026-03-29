import { create } from "zustand";

type UIStore = {
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
};

export const useUIStore = create<UIStore>()((set) => ({
  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
  },
  hideToast: () => {
    set({ toastMessage: null });
  },
}));
