import { useState } from "react";
import { CooldownLabel } from "../features/cooldown/components/CooldownLabel";
import { Modal } from "./ui/Modal";

export function LastAttemptModal({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) {
  const [mountedAt] = useState(() => Date.now());

  return (
    <Modal
      isOpen={isOpen}
      zIndex={300}
      className="border-danger/25 flex flex-col items-center text-center py-8 px-6"
      style={{
        background: "linear-gradient(155deg, #1a0f16, #0d0810)",
        boxShadow: "0 0 40px #ff6b8a15, inset 0 1px 0 #ffffff08",
      }}
    >
      <span className="text-[2.5rem] mb-4 block" style={{ filter: "drop-shadow(0 0 16px #ff6b8a80)" }}>✦⏳</span>
      <h2 className="font-[var(--font-cinzel-decorative)] text-[1rem] text-gold mb-3 tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">Dernière écoute</h2>
      <p className="text-[0.82rem] leading-relaxed text-text/80 whitespace-pre-line max-w-[300px] mb-4">C'est ta dernière écoute. Après celle-ci, les voix se tairont jusqu'à l'aube. Ferme les yeux, fais le silence, et absorbe chaque mot.</p>
      <CooldownLabel
        lastTriggeredAt={mountedAt}
        className="text-[1.1rem] font-mono tracking-[0.2em] text-danger/90 mb-6 drop-shadow-[0_0_12px_#ff6b8a50]"
      />
      <button onClick={onConfirm} className="py-3 px-8 rounded-full border border-danger/40 bg-danger/10 text-danger text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 hover:bg-danger/20 active:scale-95 cursor-pointer">Je suis prêt ✦</button>
    </Modal>
  );
}
