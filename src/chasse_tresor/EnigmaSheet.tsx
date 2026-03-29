import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { ArcaneSymbolSvg } from "./ArcaneSymbol";
import type { EnigmaData } from "./data";

/** Pseudo-random from seed — deterministic starfield per card */
function seededRandom(seed: number) {
  let s = seed;

  return () => {
    s = (s * 16807 + 0) % 2147483647;

    return s / 2147483647;
  };
}

function CornerFiligree(): React.JSX.Element {
  return (
    <svg viewBox="0 0 60 60" fill="none">
      {/* Main scroll curve */}
      <path d="M4 56 Q4 28 16 16 Q28 4 56 4" stroke="var(--gold)" strokeWidth="1.2" />
      {/* Inner parallel scroll */}
      <path d="M8 52 Q8 30 18 20 Q28 10 52 8" stroke="var(--gold)" strokeWidth="0.6" opacity="0.4" />
      {/* Spiral tendril */}
      <path d="M6 6 Q10 6 12 10 Q14 14 10 16 Q6 14 8 10" stroke="var(--gold)" strokeWidth="0.8" opacity="0.7" />
      {/* Corner jewel */}
      <circle cx="6" cy="6" r="2.5" fill="var(--gold)" opacity="0.9" />
      <circle cx="6" cy="6" r="4" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
      {/* Leaf accents */}
      <path d="M20 8 Q24 4 28 8 Q24 6 20 8Z" fill="var(--gold)" opacity="0.3" />
      <path d="M8 20 Q4 24 8 28 Q6 24 8 20Z" fill="var(--gold)" opacity="0.3" />
      {/* Tiny dot accents */}
      <circle cx="16" cy="6" r="0.8" fill="var(--gold)" opacity="0.5" />
      <circle cx="6" cy="16" r="0.8" fill="var(--gold)" opacity="0.5" />
      <circle cx="36" cy="5" r="0.6" fill="var(--gold)" opacity="0.3" />
      <circle cx="5" cy="36" r="0.6" fill="var(--gold)" opacity="0.3" />
    </svg>
  );
}

function OrnateSeparator(): React.JSX.Element {
  return (
    <div className="tarot-separator-ornate">
      <svg className="separator-svg" viewBox="0 0 200 16" preserveAspectRatio="none">
        {/* Central diamond */}
        <polygon points="100,2 104,8 100,14 96,8" fill="currentColor" opacity="0.5" />
        <polygon points="100,4 102,8 100,12 98,8" fill="currentColor" opacity="0.3" />
        {/* Lines radiating from center */}
        <line x1="88" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <line x1="112" y1="8" x2="188" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        {/* Fading ends */}
        <line x1="0" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="188" y1="8" x2="200" y2="8" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        {/* Small accent dots */}
        <circle cx="80" cy="8" r="1" fill="currentColor" opacity="0.35" />
        <circle cx="120" cy="8" r="1" fill="currentColor" opacity="0.35" />
        <circle cx="60" cy="8" r="0.6" fill="currentColor" opacity="0.2" />
        <circle cx="140" cy="8" r="0.6" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );
}

function SacredGeometryRing(): React.JSX.Element {
  return (
    <svg className="sacred-geometry-ring" viewBox="0 0 100 100">
      {/* Outer dotted circle */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 3" />
      {/* Main circle */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.6" />
      {/* Inner decorative circle */}
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 4" />
      {/* Cross axes */}
      <line x1="50" y1="8" x2="50" y2="18" stroke="currentColor" strokeWidth="0.4" />
      <line x1="50" y1="82" x2="50" y2="92" stroke="currentColor" strokeWidth="0.4" />
      <line x1="8" y1="50" x2="18" y2="50" stroke="currentColor" strokeWidth="0.4" />
      <line x1="82" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="0.4" />
      {/* Diagonal ticks */}
      {[45, 135, 225, 315].map((angle) => {
        const angleRadians = (angle * Math.PI) / 180;
        const x1 = 50 + 38 * Math.cos(angleRadians);
        const y1 = 50 + 38 * Math.sin(angleRadians);
        const x2 = 50 + 44 * Math.cos(angleRadians);
        const y2 = 50 + 44 * Math.sin(angleRadians);

        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" />;
      })}
      {/* Cardinal jewels */}
      <circle cx="50" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="90" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="10" cy="50" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="90" cy="50" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function CartoucheFrame(): React.JSX.Element {
  return (
    <div className="cartouche-frame">
      <svg className="cartouche-frame-svg" viewBox="0 0 200 300" preserveAspectRatio="none">
        {/* Top scroll */}
        <path d="M30 8 Q100 0 170 8" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M20 12 Q100 4 180 12" fill="none" stroke="currentColor" strokeWidth="0.3" />
        {/* Bottom scroll */}
        <path d="M30 292 Q100 300 170 292" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M20 288 Q100 296 180 288" fill="none" stroke="currentColor" strokeWidth="0.3" />
        {/* Top center accent */}
        <circle cx="100" cy="4" r="1.5" fill="currentColor" opacity="0.4" />
        {/* Bottom center accent */}
        <circle cx="100" cy="296" r="1.5" fill="currentColor" opacity="0.4" />
        {/* Vertical side whispers */}
        <line x1="4" y1="30" x2="4" y2="270" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
        <line x1="196" y1="30" x2="196" y2="270" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
      </svg>
    </div>
  );
}

function BottomMedallion({ numeral }: Readonly<{ numeral: string }>): React.JSX.Element {
  return (
    <div className="tarot-bottom-medallion">
      <svg className="bottom-wing" viewBox="0 0 30 12">
        <path d="M28 6 Q20 2 10 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M28 6 Q20 9 12 8" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
        <circle cx="10" cy="4" r="0.8" fill="currentColor" opacity="0.5" />
      </svg>
      <span className="tarot-bottom-num">{numeral}</span>
      <svg className="bottom-wing" viewBox="0 0 30 12">
        <path d="M2 6 Q10 2 20 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M2 6 Q10 9 18 8" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
        <circle cx="20" cy="4" r="0.8" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

function SideRail({ side }: Readonly<{ side: "left" | "right" }>): React.JSX.Element {
  return (
    <svg className={`side-rail side-rail-${side}`} viewBox="0 0 6 100" preserveAspectRatio="none">
      <line x1="3" y1="0" x2="3" y2="100" stroke="currentColor" strokeWidth="0.3" />
      {/* Repeating diamond patternList */}
      {[10, 25, 40, 55, 70, 85].map((y) => (
        <polygon
          key={y}
          points={`3,${String(y - 2)} 5,${String(y)} 3,${String(y + 2)} 1,${String(y)}`}
          fill="currentColor"
          opacity="0.6"
        />
      ))}
    </svg>
  );
}

function Starfield({ seed }: Readonly<{ seed: number }>): React.JSX.Element {
  const starList = useMemo(() => {
    const rng = seededRandom(seed);

    return Array.from({ length: 30 }, () => ({
      cx: rng() * 100,
      cy: rng() * 100,
      r: 0.2 + rng() * 0.5,
      opacity: 0.15 + rng() * 0.35,
    }));
  }, [seed]);

  return (
    <svg className="tarot-starfield" viewBox="0 0 100 100" preserveAspectRatio="none">
      {starList.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="var(--gold)" opacity={s.opacity} />
      ))}
    </svg>
  );
}

async function downloadCard(cardElement: HTMLElement, enigma: EnigmaData): Promise<void> {
  const dataUrl = await toPng(cardElement, { pixelRatio: 3 });
  const link = document.createElement("a");
  link.download = `carte-${enigma.number}-${enigma.title.replaceAll(/[^\dA-Za-zÀ-ÿ]/g, "_")}.png`;
  link.href = dataUrl;
  link.click();
}

export function EnigmaSheet({ enigma, index }: Readonly<{ enigma: EnigmaData; index: number }>): React.JSX.Element {
  const { t } = useTranslation("tresor");
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tarot-card-wrapper">
      <div className="tarot-card" ref={cardRef}>
        {/* Ornate frame */}
        <div className="tarot-frame" />

        {/* Starfield constellation */}
        <Starfield seed={index * 7 + 42} />

        {/* Corner filigrees */}
        <div className="corner-flourish corner-fl-tl">
          <CornerFiligree />
        </div>
        <div className="corner-flourish corner-fl-tr">
          <CornerFiligree />
        </div>
        <div className="corner-flourish corner-fl-bl">
          <CornerFiligree />
        </div>
        <div className="corner-flourish corner-fl-br">
          <CornerFiligree />
        </div>

        {/* Mid-frame accent dots */}
        <div className="frame-dot frame-dot-top" />
        <div className="frame-dot frame-dot-bottom" />
        <div className="frame-dot frame-dot-left" />
        <div className="frame-dot frame-dot-right" />

        {/* Side decorative rails */}
        <SideRail side="left" />
        <SideRail side="right" />

        <div className="tarot-content">
          {/* Top numeral */}
          <div className="tarot-top">
            <div className="tarot-numeral">{enigma.number}</div>
          </div>

          {/* Ornate separator */}
          <OrnateSeparator />

          {/* Sacred geometry ring + arcane symbol */}
          <div className="tarot-symbol-area">
            <SacredGeometryRing />
            <ArcaneSymbolSvg symbol={enigma.symbol} />
          </div>

          {/* Title */}
          <div className="tarot-title">{t(`enigmas.${String(index)}.title`, { defaultValue: enigma.title })}</div>

          {/* Ornate separator */}
          <OrnateSeparator />

          {/* Riddle cartouche with decorative frame */}
          <div className="tarot-cartouche">
            <CartoucheFrame />
            <p className="tarot-riddle">{t(`enigmas.${String(index)}.riddle`, { defaultValue: enigma.riddle })}</p>
          </div>

          {/* Hint */}
          <div className="tarot-hint">
            <span className="hint-icon">◈</span>
            <span>{t(`enigmas.${String(index)}.hint`, { defaultValue: enigma.hint })}</span>
          </div>

          {/* Bottom medallion */}
          <BottomMedallion numeral={enigma.number} />
        </div>
      </div>
      <button
        className="card-download-btn"
        onClick={() => {
          if (cardRef.current) {
            void downloadCard(cardRef.current, enigma);
          }
        }}
      >
        PNG
      </button>
    </div>
  );
}
