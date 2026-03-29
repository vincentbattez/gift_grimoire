import { useForgeStore } from "../features/forges/store";
import { Modal } from "./ui/Modal";

export function AudioWarningModal({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) {
  const acknowledgeAudioWarning = useForgeStore((s) => s.acknowledgeAudioWarning);

  function handleConfirm() {
    acknowledgeAudioWarning();
    onConfirm();
  }

  return (
    <Modal
      isOpen={isOpen}
      zIndex={300}
      className="border-accent/25 flex flex-col items-center text-center py-8 px-6"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        boxShadow: "0 0 40px #9b6dff15, inset 0 1px 0 #ffffff08",
      }}
    >
      <span className="text-[2.5rem] mb-4 block" style={{ filter: "drop-shadow(0 0 16px #9b6dff80)" }}>
        ⚠✦
      </span>
      <h2 className="font-[var(--font-cinzel-decorative)] text-[1rem] text-gold mb-3 tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
        Un avertissement ancien
      </h2>
      <p className="text-[0.82rem] leading-relaxed text-text/80 whitespace-pre-line max-w-[300px] mb-6">
        Les voix de ce grimoire ne se répètent pas à l'infini. Tu n'as que quelques écoutes par jour — tends l'oreille,
        concentre-toi, et ne laisse aucun murmure t'échapper.
      </p>
      <button
        onClick={handleConfirm}
        className="py-3 px-8 rounded-full border border-accent/40 bg-accent/10 text-accent text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 hover:bg-accent/20 active:scale-95 cursor-pointer"
      >
        J'ai compris ✦
      </button>
    </Modal>
  );
}
