import { useState, useEffect } from "react";
import { useStore } from "../store";

export function AudioWarningModal({ onConfirm }: { onConfirm: () => void }) {
  const acknowledgeAudioWarning = useStore((s) => s.acknowledgeAudioWarning);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  function handleConfirm() {
    setExiting(true);
    acknowledgeAudioWarning();
    setTimeout(onConfirm, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center transition-opacity duration-300 ${
        entered && !exiting ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-[360px] mx-4 flex flex-col items-center text-center py-8 px-6 rounded-[18px] border border-accent/25 transition-all duration-300 ${
          entered && !exiting ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          background: "linear-gradient(155deg, #130f26, #0b0917)",
          boxShadow: "0 0 40px #9b6dff15, inset 0 1px 0 #ffffff08",
        }}
      >
        <span
          className="text-[2.5rem] mb-4 block"
          style={{ filter: "drop-shadow(0 0 16px #9b6dff80)" }}
        >
          ⚠✦
        </span>

        <h2 className="font-[var(--font-cinzel-decorative)] text-[1rem] text-gold mb-3 tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
          Un avertissement ancien
        </h2>

        <p className="text-[0.82rem] leading-relaxed text-text/80 whitespace-pre-line max-w-[300px] mb-6">
          Les voix de ce grimoire ne se répètent pas à l'infini. Tu n'as que quelques écoutes par jour — tends l'oreille, concentre-toi, et ne laisse aucun murmure t'échapper.
        </p>

        <button
          onClick={handleConfirm}
          className="py-3 px-8 rounded-full border border-accent/40 bg-accent/10 text-accent text-[0.78rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 hover:bg-accent/20 active:scale-95 cursor-pointer"
        >
          J'ai compris ✦
        </button>
      </div>
    </div>
  );
}
