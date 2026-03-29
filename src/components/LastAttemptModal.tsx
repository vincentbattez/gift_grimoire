import { useState } from "react";
import { CooldownLabel } from "@features/cooldown/components/CooldownLabel";
import { Modal } from "./ui/Modal";

export function LastAttemptModal({
  isOpen,
  onConfirm,
}: Readonly<{ isOpen: boolean; onConfirm: () => void }>): React.JSX.Element {
  const [mountedAt] = useState(() => Date.now());

  return (
    <Modal
      isOpen={isOpen}
      zIndex={300}
      className="border-danger/25 flex flex-col items-center px-6 py-8 text-center"
      style={{
        background: "linear-gradient(155deg, #1a0f16, #0d0810)",
        boxShadow: "0 0 40px #ff6b8a15, inset 0 1px 0 #ffffff08",
      }}
    >
      <span className="mb-4 block text-[2.5rem]" style={{ filter: "drop-shadow(0 0 16px #ff6b8a80)" }}>
        ✦⏳
      </span>
      <h2 className="text-gold mb-3 text-[1rem] font-[var(--font-cinzel-decorative)] tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
        Dernière écoute
      </h2>
      <p className="text-text/80 mb-4 max-w-[300px] text-[0.82rem] leading-relaxed whitespace-pre-line">
        C'est ta dernière écoute. Après celle-ci, les voix se tairont jusqu'à l'aube. Ferme les yeux, fais le silence,
        et absorbe chaque mot.
      </p>
      <CooldownLabel
        lastTriggeredAt={mountedAt}
        className="text-danger/90 mb-6 font-mono text-[1.1rem] tracking-[0.2em] drop-shadow-[0_0_12px_#ff6b8a50]"
      />
      <button
        onClick={onConfirm}
        className="border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 cursor-pointer rounded-full border px-8 py-3 text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
      >
        Je suis prêt ✦
      </button>
    </Modal>
  );
}
