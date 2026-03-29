/** Overlay de divination — affiché pendant le suspense quand le grimoire hésite */
export function DoubtOverlay({
  visible,
  onConfirm,
  onCancel,
}: Readonly<{
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>): React.JSX.Element {
  return (
    <>
      {/* Fond opaque derrière la sheet */}
      <div
        className={`absolute inset-0 z-[19] rounded-t-3xl transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "rgba(6, 4, 14, 0.92)", backdropFilter: "blur(8px)" }}
      />

      {/* Panneau de doute */}
      <div
        className={`border-accent/15 absolute right-3 bottom-3 left-3 z-20 rounded-2xl border transition-all duration-500 ${visible ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(30, 20, 60, 0.98), rgba(10, 8, 20, 0.99))",
          boxShadow: "0 -4px 30px rgba(155, 109, 255, 0.08), 0 0 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Particules flottantes */}
        {visible && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="bg-accent/60 absolute h-[2px] w-[2px] rounded-full"
                style={{
                  left: `${String(15 + i * 10)}%`,
                  bottom: `${String(10 + (i % 3) * 20)}%`,
                  animation: `doubt-dust ${String(2.5 + i * 0.4)}s ease-in-out ${String(i * 0.3)}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative flex flex-col items-center px-6 pt-6 pb-7 text-center">
          {/* Runes en orbite */}
          {visible && (
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0" style={{ animation: "doubt-orbit 12s linear infinite" }}>
                {["᛭", "ᚱ", "ᛟ", "ᚦ", "ᛈ", "ᚹ"].map((rune, i) => (
                  <span
                    key={i}
                    className="text-accent/30 absolute text-[0.5rem] font-light"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${String(i * 60)}deg) translateY(-66px) rotate(-${String(i * 60)}deg)`,
                      animation: `doubt-glyph-pulse 2.5s ease-in-out ${String(i * 0.4)}s infinite`,
                    }}
                  >
                    {rune}
                  </span>
                ))}
              </div>
              <div className="absolute inset-[20%]" style={{ animation: "doubt-orbit-reverse 8s linear infinite" }}>
                {["✧", "◇", "✦", "◆"].map((sym, i) => (
                  <span
                    key={i}
                    className="text-accent/20 absolute text-[0.4rem]"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${String(i * 90 + 45)}deg) translateY(-36px) rotate(-${String(i * 90 + 45)}deg)`,
                      animation: `doubt-glyph-pulse 2s ease-in-out ${String(i * 0.5 + 0.2)}s infinite`,
                    }}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            className="text-accent/70 mb-3 text-[2rem]"
            style={visible ? { animation: "doubt-core-breathe 3s ease-in-out infinite" } : undefined}
          >
            ✦
          </div>
          <p
            className="text-accent/70 mb-1.5 text-[1rem] font-[var(--font-cinzel-decorative)] tracking-[0.15em] uppercase"
            style={visible ? { animation: "doubt-text-in 0.6s ease-out 0.1s both" } : undefined}
          >
            Le grimoire hésite
          </p>
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <div
              className="to-accent/30 h-[1px] w-8 origin-right bg-gradient-to-r from-transparent"
              style={visible ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
            <span className="text-accent/25 text-[0.35rem]">◆</span>
            <div
              className="to-accent/30 h-[1px] w-8 origin-left bg-gradient-to-l from-transparent"
              style={visible ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
          </div>
          <p
            className="text-text/80 text-[0.90rem] leading-relaxed font-[var(--font-cinzel)]"
            style={visible ? { animation: "doubt-text-in 0.6s ease-out 0.25s both" } : undefined}
          >
            Es-tu certaine de vouloir soumettre
            <br />
            <span className="text-accent/60 text-[0.85rem]">cette réponse aux runes ?</span>
          </p>
        </div>

        <div
          className="relative flex gap-3 px-5 pt-3 pb-8"
          style={visible ? { animation: "doubt-btn-in 0.5s ease-out 0.45s both" } : undefined}
        >
          <button
            onClick={onCancel}
            className="text-text/70 relative flex-1 cursor-pointer overflow-hidden rounded-[12px] border border-[#3a2a5a60] py-3.5 text-[0.68rem] font-[var(--font-cinzel)] font-semibold tracking-[0.1em] uppercase transition-all duration-200 active:scale-[0.94]"
            style={{ background: "linear-gradient(160deg, rgba(30, 22, 55, 0.8), rgba(16, 12, 32, 0.9))" }}
          >
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              <span className="text-accent/30 text-[0.5rem]">◁</span>
              Reformuler
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="relative flex-1 cursor-pointer overflow-hidden rounded-[12px] border-none py-3.5 text-[0.68rem] font-[var(--font-cinzel)] font-semibold tracking-[0.1em] text-white uppercase transition-all duration-200 active:scale-[0.94]"
            style={{
              background: "linear-gradient(160deg, #5a3a8a, #7b5dbd)",
              boxShadow: "0 4px 20px #9b6dff25, inset 0 1px 0 #ffffff10",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "envelope-shimmer 3s ease-in-out infinite",
              }}
            />
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              J'en suis sûre
              <span className="text-[0.5rem]">✦</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
