import { forwardRef } from "react";
import type { EnigmaData } from "./data";
import { ArcaneSymbolSvg } from "./ArcaneSymbol";

export const EnigmaSheet = forwardRef<
  HTMLDivElement,
  { enigma: EnigmaData; index: number }
>(function EnigmaSheet({ enigma, index }, ref) {
  return (
    <div className="tarot-card" ref={ref}>
      {/* Outer ornate frame */}
      <div className="tarot-frame" />

      {/* Corner flourishes */}
      <svg className="corner-flourish corner-fl-tl" viewBox="0 0 40 40">
        <path d="M4 36 Q4 4 36 4" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="2.5" fill="var(--gold)" opacity="0.8" />
      </svg>
      <svg className="corner-flourish corner-fl-tr" viewBox="0 0 40 40">
        <path d="M4 36 Q4 4 36 4" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="2.5" fill="var(--gold)" opacity="0.8" />
      </svg>
      <svg className="corner-flourish corner-fl-bl" viewBox="0 0 40 40">
        <path d="M4 36 Q4 4 36 4" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="2.5" fill="var(--gold)" opacity="0.8" />
      </svg>
      <svg className="corner-flourish corner-fl-br" viewBox="0 0 40 40">
        <path d="M4 36 Q4 4 36 4" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <circle cx="5" cy="5" r="2.5" fill="var(--gold)" opacity="0.8" />
      </svg>

      <div className="tarot-content">
        {/* Top arc with number */}
        <div className="tarot-top">
          <div className="tarot-numeral">{enigma.number}</div>
        </div>

        {/* Separator */}
        <div className="tarot-separator">
          <span className="sep-dot">✦</span>
        </div>

        {/* Central arcane symbol */}
        <div className="tarot-symbol-area">
          <ArcaneSymbolSvg symbol={enigma.symbol} />
        </div>

        {/* Title */}
        <div className="tarot-title">{enigma.title}</div>

        {/* Separator */}
        <div className="tarot-separator">
          <span className="sep-dot">✦</span>
        </div>

        {/* Riddle cartouche */}
        <div className="tarot-cartouche">
          <p className="tarot-riddle">{enigma.riddle}</p>
        </div>

        {/* Hint */}
        <div className="tarot-hint">
          <span className="hint-icon">◈</span>
          <span>{enigma.hint}</span>
        </div>

        {/* Bottom number */}
        <div className="tarot-bottom">
          <span>{enigma.number}</span>
        </div>
      </div>
    </div>
  );
});
