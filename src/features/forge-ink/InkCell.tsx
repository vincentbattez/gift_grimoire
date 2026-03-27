interface InkCellProps {
  cellKey: string;
  row: number;
  col: number;
  letter: string | undefined;
  isRevealed: boolean;
  isMissed: boolean;
  isAnimating: boolean;
  isAnimatingHit: boolean;
  wordSolved: boolean;
  isNewlyRevealed: boolean;
  isAnimatingMiss: boolean;
  isHotLetter: boolean;
  proximity: "hot" | "warm" | undefined;
  proximityCenter: string | null;
  disabled: boolean;
  onTap: (row: number, col: number) => void;
}

export function InkCell({
  cellKey,
  row,
  col,
  letter,
  isRevealed,
  isMissed,
  isAnimating,
  isAnimatingHit,
  wordSolved,
  isNewlyRevealed,
  isAnimatingMiss,
  isHotLetter,
  proximity,
  proximityCenter,
  disabled,
  onTap,
}: InkCellProps) {
  return (
    <button
      data-cell={cellKey}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onTap(row, col);
      }}
      className={[
        "relative flex items-center justify-center",
        "aspect-square min-h-[44px] rounded-[5px]",
        "text-xs font-cinzel font-bold",
        "select-none touch-none outline-none",
        "transition-all duration-300",
        isRevealed
          ? wordSolved
            ? "border border-gold/50 shadow-[0_0_10px_#e8c96a25]"
            : `border border-gold/25 ${isNewlyRevealed ? "ink-cell-revealing" : ""}`
          : isAnimating
            ? "border border-accent/50"
            : isMissed
              ? "border border-muted/20"
              : proximity === "hot"
                ? "ink-proximity-hot border"
                : proximity === "warm"
                  ? "ink-proximity-warm border"
                  : "border border-locked-border/50 active:border-accent/40 active:scale-[0.93]",
      ].join(" ")}
      style={{
        background: isRevealed
          ? wordSolved
            ? "linear-gradient(135deg, #1c1a0a, #0f0e07)"
            : "linear-gradient(135deg, #181508, #0c0b05)"
          : isAnimating
            ? "linear-gradient(135deg, #1a1030, #0d0920)"
            : isMissed
              ? "linear-gradient(135deg, #0d0a1a, #07060f)"
              : proximity === "hot"
                ? "linear-gradient(135deg, #1e1400, #130e00)"
                : proximity === "warm"
                  ? "linear-gradient(135deg, #171200, #0e0c00)"
                  : "linear-gradient(135deg, #130f26, #0b0917)",
      }}
    >
      {/* Revealed letter */}
      {isRevealed && letter && (
        <span
          className="text-gold leading-none z-10"
          style={{
            textShadow: wordSolved
              ? "0 0 12px #e8c96a90"
              : "0 0 6px #e8c96a50",
            fontSize: "0.7rem",
            animation: isNewlyRevealed
              ? "ink-letter-crystallize 0.85s ease-out both"
              : wordSolved
                ? "gold-letter-shimmer 2.5s ease-in-out infinite"
                : undefined,
          }}
        >
          {letter}
        </span>
      )}

      {/* Sparkle — adjacent letter cell after miss */}
      {isHotLetter && (
        <span
          key={proximityCenter}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4px] z-[8]"
        >
          <span
            className="absolute"
            style={{
              width: "55%",
              height: "130%",
              top: "-15%",
              left: 0,
              background:
                "linear-gradient(90deg, transparent, #f59e0b90, #fde68a55, transparent)",
              animation: "proximity-sparkle-sweep 0.65s ease-out 0.08s both",
            }}
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, #f59e0b30 0%, transparent 65%)",
              animation: "proximity-sparkle-flash 0.45s ease-out both",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              top: "22%",
              left: "28%",
              background: "#fde68a",
              boxShadow: "0 0 4px #f59e0b",
              animation: "proximity-sparkle-dot 0.6s ease-out 0.1s both",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              bottom: "25%",
              right: "30%",
              background: "#fde68a",
              boxShadow: "0 0 3px #f59e0b",
              animation: "proximity-sparkle-dot 0.55s ease-out 0.18s both",
            }}
          />
        </span>
      )}

      {/* Drop animation */}
      {isAnimating && (
        <span
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          style={{ animation: "ink-drop-fall 0.42s ease-in both" }}
        >
          <span
            className="rounded-full"
            style={{
              width: 8,
              height: 10,
              background: "radial-gradient(circle, #c4a3ff, #9b6dff)",
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              boxShadow: "0 0 6px #9b6dff80",
            }}
          />
        </span>
      )}

      {/* Hit ripple — ink bleed */}
      {isAnimatingHit && (
        <span className="absolute inset-0 pointer-events-none z-[15]">
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "ink-spread-ripple 0.42s ease-out both" }}
          >
            <span
              className="rounded-full"
              style={{
                width: "88%",
                height: "88%",
                background:
                  "radial-gradient(circle, #e8c96a42 0%, #9b6dff22 55%, transparent 82%)",
              }}
            />
          </span>
          <span
            className="absolute rounded-full"
            style={{
              width: "70%",
              height: "65%",
              top: "12%",
              left: "18%",
              background:
                "radial-gradient(ellipse, #e8c96a30 0%, transparent 70%)",
              animation: "ink-bleed-a 0.5s ease-out both",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: "55%",
              height: "72%",
              top: "22%",
              left: "8%",
              background:
                "radial-gradient(ellipse, #9b6dff25 0%, transparent 65%)",
              animation: "ink-bleed-b 0.48s ease-out 0.03s both",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: "60%",
              height: "58%",
              top: "6%",
              left: "28%",
              background:
                "radial-gradient(ellipse, #e8c96a20 0%, transparent 68%)",
              animation: "ink-bleed-c 0.52s ease-out 0.05s both",
            }}
          />
        </span>
      )}

      {/* Miss splash (ephemeral) */}
      {isAnimatingMiss && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-[12]">
          <span
            className="absolute rounded-full"
            style={{
              width: "66%",
              height: "66%",
              background:
                "radial-gradient(ellipse, #1a1240 0%, #0d0920 55%, transparent 82%)",
              animation: "ink-miss-splash 1.5s ease-out both",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: "40%",
              height: "44%",
              top: "12%",
              left: "16%",
              background:
                "radial-gradient(ellipse, #130f26 0%, #09071a 68%, transparent)",
              animation: "ink-miss-blob 1.5s ease-out 0.06s both",
            }}
          />
        </span>
      )}

      {/* Miss stain (permanent) */}
      {isMissed && !isAnimatingMiss && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="absolute rounded-full"
            style={{
              width: "42%",
              height: "42%",
              background:
                "radial-gradient(ellipse, #16122a 0%, #0d0920 65%, transparent 90%)",
              opacity: 0.6,
            }}
          />
          <span
            className="absolute text-muted/18 z-10"
            style={{ fontSize: "0.32rem" }}
          >
            ✕
          </span>
        </span>
      )}
    </button>
  );
}
