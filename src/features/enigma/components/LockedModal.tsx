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
      className="fixed inset-0 z-[100] flex flex-color items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #1a1040ee, #07060ffa)",
        animation: isClosing ? "locked-modal-out 0.3s ease-in forwards" : "locked-modal-in 0.3s ease-out",
      }}
      onClick={handleClose}
    >
      {/* Floating lock — large version */}
      <div className="mb-8" style={{ transform: "scale(2.2)", animation: "locked-lock-float 3s ease-in-out infinite" }}>
        <LockIcon />
      </div>

      {/* Text */}
      <p className="text-[0.75rem] tracking-[0.25em] text-muted uppercase text-center px-8 leading-relaxed">
        Ce mystère est scellé
      </p>
      <p className="text-[0.6rem] tracking-[0.15em] text-muted/50 text-center px-10 mt-3 leading-relaxed">
        Forgez une clé dans la Forge pour briser le sceau
      </p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="mt-8 px-5 py-2 rounded-full border border-muted/25 text-[0.6rem] tracking-[0.2em] text-muted/60 uppercase
          hover:border-muted/40 hover:text-muted active:scale-95 transition-all duration-200"
        style={{ background: "linear-gradient(155deg, #1a1438, #110e22)" }}
      >
        Fermer
      </button>
    </div>,
    document.body,
  );
}
