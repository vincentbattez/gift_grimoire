interface InkVictoryModalProps {
  onContinue: () => void;
}

export function InkVictoryModal({ onContinue }: InkVictoryModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "rgba(7,6,15,0.88)",
        animation: "love-letter-overlay-in 0.3s ease-out both",
      }}
    >
      <div
        className="mx-6 px-7 py-8 rounded-2xl flex flex-col items-center gap-5 text-center"
        style={{
          border: "1px solid rgba(232,201,106,0.35)",
          background: "linear-gradient(155deg, #1a1430, #0d0920)",
          boxShadow:
            "0 0 60px rgba(232,201,106,0.15), 0 0 120px rgba(232,201,106,0.07)",
          animation: "ink-modal-reveal 0.55s ease-out both",
        }}
      >
        <div className="text-[0.45rem] tracking-[0.4em] text-gold/40 uppercase">
          ✦ L'Encre Revelatrice ✦
        </div>

        <p
          className="text-[0.8rem] text-text/90 leading-loose italic"
          style={{
            fontFamily: "var(--font-cinzel)",
            letterSpacing: "0.05em",
            textShadow: "0 0 20px rgba(232,201,106,0.15)",
          }}
        >
          "maintenant, tu sais ce qu'il te reste a faire..."
        </p>

        <div className="flex gap-2 text-gold/25 text-base">
          <span>ᚠ</span>
          <span>ᚢ</span>
          <span>ᚦ</span>
        </div>

        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded-xl text-[0.6rem] tracking-[0.2em] uppercase
            transition-all duration-200 active:scale-95"
          style={{
            border: "1px solid rgba(232,201,106,0.4)",
            color: "rgba(232,201,106,0.85)",
            background: "rgba(232,201,106,0.06)",
          }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
