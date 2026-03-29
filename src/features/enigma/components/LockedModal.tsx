import { useState } from "react";
import { createPortal } from "react-dom";
import { LockIcon } from "@components/LockIcon";

export function LockedModal({ onClose }: { readonly onClose: () => void }): React.JSX.Element {
  const [isClosing, setIsClosing] = useState(false);

  function handleClose(e?: React.MouseEvent): void {
    e?.stopPropagation();

    if (isClosing) {
      return;
    }
    setIsClosing(true);
    setTimeout(onClose, 300);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #1a1040ee, #07060ffa)",
        animation: isClosing ? "locked-modal-out 0.3s ease-in forwards" : "locked-modal-in 0.3s ease-out",
      }}
      role="presentation"
      onClick={handleClose}
    >
      {/* Floating lock — large version */}
      <div className="mb-8" style={{ transform: "scale(2.2)", animation: "locked-lock-float 3s ease-in-out infinite" }}>
        <LockIcon />
      </div>

      {/* Text */}
      <p className="text-muted px-8 text-center text-[0.75rem] leading-relaxed tracking-[0.25em] uppercase">
        Ce mystère est scellé
      </p>
      <p className="text-muted/50 mt-3 px-10 text-center text-[0.6rem] leading-relaxed tracking-[0.15em]">
        Forgez une clé dans la Forge pour briser le sceau
      </p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="border-muted/25 text-muted/60 hover:border-muted/40 hover:text-muted mt-8 rounded-full border px-5 py-2 text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-200 active:scale-95"
        style={{ background: "linear-gradient(155deg, #1a1438, #110e22)" }}
      >
        Fermer
      </button>
    </div>,
    document.body,
  );
}
