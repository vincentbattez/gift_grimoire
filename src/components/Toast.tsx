import { useEffect } from "react";
import { useUIStore } from "@/store";

export function Toast(): React.JSX.Element {
  const message = useUIStore((s) => s.toastMessage);
  const hideToast = useUIStore((s) => s.hideToast);

  useEffect(() => {
    if (!message) {
      return;
    }
    const t = setTimeout(hideToast, 3200);

    return () => {
      clearTimeout(t);
    };
  }, [message, hideToast]);

  return (
    <div
      className={`text-text fixed top-5 left-1/2 z-200 max-w-[90vw] rounded-2xl px-5 py-2.5 text-center text-[0.78rem] whitespace-nowrap transition-all duration-400 ${
        message ? "-translate-x-1/2 translate-y-0 opacity-100" : "-translate-x-1/2 -translate-y-[90px] opacity-0"
      }`}
      style={{
        background: "linear-gradient(135deg, #2a1a4a, #1a1030)",
        border: "1px solid var(--color-unlocked-border)",
        boxShadow: "0 8px 32px #7b5ea73a",
        transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {message}
    </div>
  );
}
