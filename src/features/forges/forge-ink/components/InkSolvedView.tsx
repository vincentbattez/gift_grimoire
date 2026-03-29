import { INK_CONFIG, LETTER_MAP } from "@features/forges/forge-ink/config";

export function InkSolvedView(): React.JSX.Element {
  return (
    <div className="mt-4">
      <div
        className="grid gap-[2px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${String(INK_CONFIG.gridCols)}, 1fr)`,
          maxWidth: "min(100%, 280px)",
        }}
      >
        {Array.from({ length: INK_CONFIG.gridCols * INK_CONFIG.gridRows }, (_, idx) => {
          const row = Math.floor(idx / INK_CONFIG.gridCols);
          const color = idx % INK_CONFIG.gridCols;
          const entry = LETTER_MAP.get(`${String(row)},${String(color)}`);

          return (
            <div
              key={idx}
              className="flex items-center justify-center aspect-square rounded-[3px]"
              style={{
                background: entry ? "linear-gradient(135deg, #1c1a0a, #0f0e07)" : "transparent",
                border: entry ? "1px solid rgba(232,201,106,0.3)" : "none",
                boxShadow: entry ? "0 0 6px #e8c96a15" : "none",
              }}
            >
              {entry && (
                <span
                  className="text-gold leading-none"
                  style={{
                    fontSize: "0.55rem",
                    fontFamily: "var(--font-cinzel)",
                    fontWeight: 700,
                    textShadow: "0 0 8px #e8c96a60",
                    animation: "gold-letter-shimmer 2.5s ease-in-out infinite",
                    animationDelay: `${String((row + color) * 0.12)}s`,
                  }}
                >
                  {entry.letter}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
