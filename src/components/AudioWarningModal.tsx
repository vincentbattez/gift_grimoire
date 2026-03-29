import { useForgeStore } from "@features/forges/store";
import { Modal } from "./ui/Modal";

export function AudioWarningModal({
  isOpen,
  onConfirm,
}: Readonly<{
  isOpen: boolean;
  onConfirm: () => void;
}>): React.JSX.Element {
  const acknowledgeAudioWarning = useForgeStore((s) => s.acknowledgeAudioWarning);

  function handleConfirm(): void {
    acknowledgeAudioWarning();
    onConfirm();
  }

  return (
    <Modal
      isOpen={isOpen}
      zIndex={300}
      className="border-accent/25 flex-color flex items-center px-6 py-8 text-center"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        boxShadow: "0 0 40px #9b6dff15, inset 0 1px 0 #ffffff08",
      }}
    >
      <span className="mb-4 block text-[2.5rem]" style={{ filter: "drop-shadow(0 0 16px #9b6dff80)" }}>
        ⚠✦
      </span>
      <h2 className="text-gold mb-3 text-[1rem] font-[var(--font-cinzel-decorative)] tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
        Un avertissement ancien
      </h2>
      <p className="text-text/80 mb-6 max-w-[300px] text-[0.82rem] leading-relaxed whitespace-pre-line">
        Les voix de ce grimoire ne se répètent pas à l'infini. Tu n'as que quelques écoutes par jour — tends l'oreille,
        concentre-toi, et ne laisse aucun murmure t'échapper.
      </p>
      <button
        onClick={handleConfirm}
        className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer rounded-full border px-8 py-3 text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
      >
        J'ai compris ✦
      </button>
    </Modal>
  );
}
