/** Overlay de divination — affiché pendant le suspense quand le grimoire hésite */
export function DoubtOverlay({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  return (
    <>
      {/* Fond opaque derrière la sheet */}
      <div
        className={`absolute inset-0 z-[19] rounded-t-3xl transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(6, 4, 14, 0.92)", backdropFilter: "blur(8px)" }}
      />

      {/* Panneau de doute */}
      <div
        className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-accent/15 transition-all duration-500 ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"}`}
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(30, 20, 60, 0.98), rgba(10, 8, 20, 0.99))",
          boxShadow: "0 -4px 30px rgba(155, 109, 255, 0.08), 0 0 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Particules flottantes */}
        {visible && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full bg-accent/60"
                style={{
                  left: `${String(15 + i * 10)}%`,
                  bottom: `${String(10 + (i % 3) * 20)}%`,
                  animation: `doubt-dust ${String(2.5 + i * 0.4)}s ease-in-out ${String(i * 0.3)}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative flex flex-color items-center px-6 pt-6 pb-7 text-center">
          {/* Runes en orbite */}
          {visible && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] pointer-events-none">
              <div className="absolute inset-0" style={{ animation: "doubt-orbit 12s linear infinite" }}>
                {["᛭", "ᚱ", "ᛟ", "ᚦ", "ᛈ", "ᚹ"].map((rune, i) => (
                  <span
                    key={i}
                    className="absolute text-[0.5rem] text-accent/30 font-light"
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
                    className="absolute text-[0.4rem] text-accent/20"
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
            className="text-[2rem] mb-3 text-accent/70"
            style={visible ? { animation: "doubt-core-breathe 3s ease-in-out infinite" } : undefined}
          >
            ✦
          </div>
          <p
            className="font-[var(--font-cinzel-decorative)] text-[1rem] text-accent/70 mb-1.5 tracking-[0.15em] uppercase"
            style={visible ? { animation: "doubt-text-in 0.6s ease-out 0.1s both" } : undefined}
          >
            Le grimoire hésite
          </p>
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div
              className="h-[1px] w-8 bg-gradient-to-r from-transparent to-accent/30 origin-right"
              style={visible ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
            <span className="text-[0.35rem] text-accent/25">◆</span>
            <div
              className="h-[1px] w-8 bg-gradient-to-l from-transparent to-accent/30 origin-left"
              style={visible ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
          </div>
          <p
            className="font-[var(--font-cinzel)] text-[0.90rem] text-text/80 leading-relaxed"
            style={visible ? { animation: "doubt-text-in 0.6s ease-out 0.25s both" } : undefined}
          >
            Es-tu certaine de vouloir soumettre
            <br />
            <span className="text-accent/60 text-[0.85rem]">cette réponse aux runes ?</span>
          </p>
        </div>

        <div
          className="relative px-5 pb-8 pt-3 flex gap-3"
          style={visible ? { animation: "doubt-btn-in 0.5s ease-out 0.45s both" } : undefined}
        >
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-[12px] border border-[#3a2a5a60] text-text/70 font-[var(--font-cinzel)] text-[0.68rem] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.94] relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, rgba(30, 22, 55, 0.8), rgba(16, 12, 32, 0.9))" }}
          >
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              <span className="text-accent/30 text-[0.5rem]">◁</span>
              Reformuler
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-[12px] border-none text-white font-[var(--font-cinzel)] text-[0.68rem] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.94] relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #5a3a8a, #7b5dbd)",
              boxShadow: "0 4px 20px #9b6dff25, inset 0 1px 0 #ffffff10",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
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
