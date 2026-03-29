import { useTranslation } from "react-i18next";
import { useForgeStore } from "@features/forges/store";
import { Modal } from "./ui/Modal";

export function AudioWarningModal({
  isOpen,
  onConfirm,
}: Readonly<{
  isOpen: boolean;
  onConfirm: () => void;
}>): React.JSX.Element {
  const { t } = useTranslation("common");
  const acknowledgeAudioWarning = useForgeStore((s) => s.acknowledgeAudioWarning);

  function handleConfirm(): void {
    acknowledgeAudioWarning();
    onConfirm();
  }

  return (
    <Modal
      isOpen={isOpen}
      zIndex={300}
      className="border-accent/25 flex flex-col items-center px-6 py-8 text-center"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        boxShadow: "0 0 40px #9b6dff15, inset 0 1px 0 #ffffff08",
      }}
    >
      <span className="mb-4 block text-[2.5rem]" style={{ filter: "drop-shadow(0 0 16px #9b6dff80)" }}>
        ⚠✦
      </span>
      <h2 className="text-gold mb-3 text-[1rem] font-[var(--font-cinzel-decorative)] tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
        {t("audioWarning.title")}
      </h2>
      <p className="text-text/80 mb-6 max-w-[300px] text-[0.82rem] leading-relaxed whitespace-pre-line">
        {t("audioWarning.text")}
      </p>
      <button
        onClick={handleConfirm}
        className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer rounded-full border px-8 py-3 text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
      >
        {t("audioWarning.confirm")}
      </button>
    </Modal>
  );
}
