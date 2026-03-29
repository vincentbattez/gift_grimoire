import { useRef } from "react";
import { toPng } from "html-to-image";

function CornerFiligreeBack(): React.JSX.Element {
  return (
    <svg viewBox="0 0 60 60" fill="none">
      <path d="M4 56 Q4 28 16 16 Q28 4 56 4" stroke="var(--gold)" strokeWidth="1.2" />
      <path d="M8 52 Q8 30 18 20 Q28 10 52 8" stroke="var(--gold)" strokeWidth="0.6" opacity="0.4" />
      <path d="M6 6 Q10 6 12 10 Q14 14 10 16 Q6 14 8 10" stroke="var(--gold)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="6" cy="6" r="2.5" fill="var(--gold)" opacity="0.9" />
      <circle cx="6" cy="6" r="4" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
      <path d="M20 8 Q24 4 28 8 Q24 6 20 8Z" fill="var(--gold)" opacity="0.3" />
      <path d="M8 20 Q4 24 8 28 Q6 24 8 20Z" fill="var(--gold)" opacity="0.3" />
      <circle cx="16" cy="6" r="0.8" fill="var(--gold)" opacity="0.5" />
      <circle cx="6" cy="16" r="0.8" fill="var(--gold)" opacity="0.5" />
      <circle cx="36" cy="5" r="0.6" fill="var(--gold)" opacity="0.3" />
      <circle cx="5" cy="36" r="0.6" fill="var(--gold)" opacity="0.3" />
    </svg>
  );
}

/** Diamond lattice patternList — fills the card with a repeating grid */
function DiamondLattice(): React.JSX.Element {
  const columnCount = 9;
  const rowCount = 14;
  const cellWidth = 200 / columnCount;
  const cellHeight = 300 / rowCount;

  return (
    <svg className="back-lattice" viewBox="0 0 200 300" preserveAspectRatio="none">
      {Array.from({ length: rowCount }, (_row, rowIndex) =>
        Array.from({ length: columnCount }, (_column, columnIndex) => {
          const cellCenterX = cellWidth * columnIndex + cellWidth / 2;
          const cellCenterY = cellHeight * rowIndex + cellHeight / 2;

          return (
            <g key={`${String(rowIndex)}-${String(columnIndex)}`}>
              <polygon
                points={`${String(cellCenterX)},${String(cellCenterY - cellHeight / 2)} ${String(cellCenterX + cellWidth / 2)},${String(cellCenterY)} ${String(cellCenterX)},${String(cellCenterY + cellHeight / 2)} ${String(cellCenterX - cellWidth / 2)},${String(cellCenterY)}`}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="0.3"
                opacity="0.12"
              />
              <circle cx={cellCenterX} cy={cellCenterY} r="0.6" fill="var(--gold)" opacity="0.1" />
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** Central mandala — 180° rotationally symmetric */
function CentralMandala(): React.JSX.Element {
  return (
    <svg className="back-mandala" viewBox="0 0 200 200">
      {/* Outermost circle */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.3" />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        strokeDasharray="2 3"
        opacity="0.2"
      />

      {/* Second ring */}
      <circle cx="100" cy="100" r="76" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.35" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="var(--gold)" strokeWidth="0.3" opacity="0.15" />

      {/* Radiating lines — 12 spokes */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 100 + 44 * Math.cos(angle);
        const y1 = 100 + 44 * Math.sin(angle);
        const x2 = 100 + 76 * Math.cos(angle);
        const y2 = 100 + 76 * Math.sin(angle);

        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="0.4" opacity="0.2" />;
      })}

      {/* Spoke end jewels — 12 dots on outer ring */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const cx = 100 + 76 * Math.cos(angle);
        const cy = 100 + 76 * Math.sin(angle);

        return <circle key={i} cx={cx} cy={cy} r="1.5" fill="var(--gold)" opacity="0.3" />;
      })}

      {/* Inner ring */}
      <circle cx="100" cy="100" r="44" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.3" />
      <circle
        cx="100"
        cy="100"
        r="40"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        strokeDasharray="3 3"
        opacity="0.15"
      />

      {/* Vesica piscis — two interlocking circles */}
      <circle cx="84" cy="100" r="30" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.2" />
      <circle cx="116" cy="100" r="30" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.2" />

      {/* Vertical vesica */}
      <circle cx="100" cy="84" r="30" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.15" />
      <circle cx="100" cy="116" r="30" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.15" />

      {/* Central star — 8-pointed */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const outerRadius = 18;
        const innerRadius = 8;
        const nextAngle = ((i * 45 + 22.5) * Math.PI) / 180;
        const x1 = 100 + outerRadius * Math.cos(angle);
        const y1 = 100 + outerRadius * Math.sin(angle);
        const x2 = 100 + innerRadius * Math.cos(nextAngle);
        const y2 = 100 + innerRadius * Math.sin(nextAngle);

        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="0.6" opacity="0.35" />;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const cx = 100 + 18 * Math.cos(angle);
        const cy = 100 + 18 * Math.sin(angle);

        return <circle key={i} cx={cx} cy={cy} r="1.2" fill="var(--gold)" opacity="0.4" />;
      })}

      {/* Central eye */}
      <circle cx="100" cy="100" r="6" fill="none" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5" />
      <circle cx="100" cy="100" r="2.5" fill="var(--gold)" opacity="0.6" />
      <circle
        cx="100"
        cy="100"
        r="10"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        strokeDasharray="1 2"
        opacity="0.25"
      />

      {/* Cardinal ornaments — small diamonds at N/S/E/W on outer ring */}
      {[0, 90, 180, 270].map((deg) => {
        const angle = (deg * Math.PI) / 180;
        const cx = 100 + 92 * Math.cos(angle);
        const cy = 100 + 92 * Math.sin(angle);

        return (
          <g key={deg}>
            <polygon
              points={`${String(cx)},${String(cy - 3)} ${String(cx + 2)},${String(cy)} ${String(cx)},${String(cy + 3)} ${String(cx - 2)},${String(cy)}`}
              fill="var(--gold)"
              opacity="0.35"
              transform={`rotate(${String(deg)} ${String(cx)} ${String(cy)})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Top/bottom decorative banner */
function Banner(): React.JSX.Element {
  return (
    <svg className="back-banner" viewBox="0 0 160 24">
      {/* Central cartouche */}
      <rect
        x="40"
        y="6"
        width="80"
        height="12"
        rx="6"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Inner line */}
      <rect
        x="44"
        y="8"
        width="72"
        height="8"
        rx="4"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.3"
        opacity="0.15"
      />
      {/* Text: GRIMOIRE */}
      <text
        x="80"
        y="15"
        textAnchor="middle"
        fontFamily="'Cinzel', serif"
        fontSize="5"
        letterSpacing="3"
        fill="var(--gold)"
        opacity="0.4"
      >
        GRIMOIRE
      </text>
      {/* Wings */}
      <line x1="38" y1="12" x2="10" y2="12" stroke="var(--gold)" strokeWidth="0.4" opacity="0.25" />
      <line x1="122" y1="12" x2="150" y2="12" stroke="var(--gold)" strokeWidth="0.4" opacity="0.25" />
      {/* End dots */}
      <circle cx="10" cy="12" r="1" fill="var(--gold)" opacity="0.3" />
      <circle cx="150" cy="12" r="1" fill="var(--gold)" opacity="0.3" />
    </svg>
  );
}

async function downloadBack(cardElement: HTMLElement): Promise<void> {
  const dataUrl = await toPng(cardElement, { pixelRatio: 3 });
  const link = document.createElement("a");
  link.download = "carte-dos.png";
  link.href = dataUrl;
  link.click();
}

export function TarotCardBack(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="tarot-card-wrapper">
      <div className="tarot-card tarot-card-back" ref={cardRef}>
        {/* Frame — same as front */}
        <div className="tarot-frame" />

        {/* Diamond lattice background */}
        <DiamondLattice />

        {/* Corner filigrees */}
        <div className="corner-flourish corner-fl-tl">
          <CornerFiligreeBack />
        </div>
        <div className="corner-flourish corner-fl-tr">
          <CornerFiligreeBack />
        </div>
        <div className="corner-flourish corner-fl-bl">
          <CornerFiligreeBack />
        </div>
        <div className="corner-flourish corner-fl-br">
          <CornerFiligreeBack />
        </div>

        {/* Mid-frame accent dots */}
        <div className="frame-dot frame-dot-top" />
        <div className="frame-dot frame-dot-bottom" />
        <div className="frame-dot frame-dot-left" />
        <div className="frame-dot frame-dot-right" />

        {/* Back content */}
        <div className="back-content">
          {/* Top banner */}
          <Banner />

          {/* Central mandala */}
          <CentralMandala />

          {/* Bottom banner — rotated 180° for symmetry */}
          <div className="back-banner-flip">
            <Banner />
          </div>
        </div>
      </div>
      <button
        className="card-download-btn"
        onClick={() => {
          if (cardRef.current) {
            void downloadBack(cardRef.current);
          }
        }}
      >
        PNG
      </button>
    </div>
  );
}
