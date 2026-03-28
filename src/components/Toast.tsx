import { useEffect } from "react";
import { useUIStore } from "../store";

export function Toast() {
  const message = useUIStore((s) => s.toastMessage);
  const hideToast = useUIStore((s) => s.hideToast);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hideToast, 3200);
    return () => clearTimeout(t);
  }, [message, hideToast]);

  return (
    <div
      className={`fixed top-5 left-1/2 z-200 rounded-2xl py-2.5 px-5 text-[0.78rem] text-text text-center whitespace-nowrap max-w-[90vw] transition-all duration-400 ${
        message
          ? "-translate-x-1/2 translate-y-0 opacity-100"
          : "-translate-x-1/2 -translate-y-[90px] opacity-0"
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
