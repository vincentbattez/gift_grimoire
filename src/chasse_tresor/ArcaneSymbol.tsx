import type { ArcaneSymbol } from "./data";

const SYMBOLS: Record<ArcaneSymbol, React.ReactNode> = {
  crown: (
    <g>
      <path d="M25 65 L35 35 L50 50 L65 35 L75 65 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="35" cy="32" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="28" r="4" fill="currentColor" />
      <circle cx="65" cy="32" r="3" fill="currentColor" opacity="0.6" />
      <line x1="25" y1="65" x2="75" y2="65" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="70" x2="78" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </g>
  ),
  swords: (
    <g>
      <line x1="35" y1="25" x2="65" y2="75" stroke="currentColor" strokeWidth="1.5" />
      <line x1="65" y1="25" x2="35" y2="75" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="38" x2="42" y2="38" stroke="currentColor" strokeWidth="1" />
      <line x1="58" y1="38" x2="72" y2="38" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
      <path d="M33 23 L35 25 L37 23" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M63 23 L65 25 L67 23" fill="none" stroke="currentColor" strokeWidth="1" />
    </g>
  ),
  tower: (
    <g>
      <rect x="38" y="35" width="24" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M35 35 L50 22 L65 35" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="45" y="55" width="10" height="20" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="41" y="40" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <rect x="53" y="40" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <line x1="32" y1="75" x2="68" y2="75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="27" r="2" fill="currentColor" opacity="0.6" />
    </g>
  ),
  wave: (
    <g>
      <path d="M20 45 Q30 35 40 45 Q50 55 60 45 Q70 35 80 45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 55 Q30 45 40 55 Q50 65 60 55 Q70 45 80 55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M25 65 Q35 58 45 65 Q55 72 65 65 Q72 60 75 62" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="50" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="35" r="3" fill="currentColor" opacity="0.4" />
    </g>
  ),
  star: (
    <g>
      <polygon points="50,25 56,42 74,42 60,53 65,70 50,60 35,70 40,53 26,42 44,42" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="48" r="1.5" fill="currentColor" />
      <line x1="50" y1="18" x2="50" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="73" x2="50" y2="77" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="19" y1="48" x2="23" y2="48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="77" y1="48" x2="81" y2="48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </g>
  ),
  flame: (
    <g>
      <path d="M50 25 Q58 38 55 48 Q62 40 58 55 Q65 48 60 62 Q58 72 50 75 Q42 72 40 62 Q35 48 42 55 Q38 40 45 48 Q42 38 50 25 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 45 Q54 52 52 60 Q50 65 48 60 Q46 52 50 45 Z" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="58" r="2" fill="currentColor" opacity="0.5" />
    </g>
  ),
  lightning: (
    <g>
      <path d="M55 22 L45 48 L55 48 L42 78" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="55" cy="22" r="2" fill="currentColor" opacity="0.6" />
      <line x1="35" y1="30" x2="38" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="65" y1="30" x2="62" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="30" y1="42" x2="34" y2="42" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="70" y1="42" x2="66" y2="42" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="42" cy="78" r="2.5" fill="currentColor" opacity="0.4" />
    </g>
  ),
  orbit: (
    <g>
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <ellipse cx="50" cy="50" rx="25" ry="10" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="50" cy="50" rx="25" ry="10" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="25" ry="10" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(120 50 50)" />
      <circle cx="75" cy="50" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="37" cy="28" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="37" cy="72" r="2" fill="currentColor" opacity="0.5" />
    </g>
  ),
  blossom: (
    <g>
      <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.6" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="35"
          rx="6"
          ry="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 3" />
    </g>
  ),
  eye: (
    <g>
      <path d="M20 50 Q35 30 50 30 Q65 30 80 50 Q65 70 50 70 Q35 70 20 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="5" fill="currentColor" />
      <circle cx="47" cy="47" r="1.5" fill="#0a0a0a" />
      <line x1="12" y1="50" x2="18" y2="50" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="82" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="22" x2="50" y2="26" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="50" y1="74" x2="50" y2="78" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </g>
  ),
};

export function ArcaneSymbolSvg({ symbol }: { symbol: ArcaneSymbol }) {
  return (
    <svg viewBox="0 0 100 100" className="arcane-symbol">
      {SYMBOLS[symbol]}
    </svg>
  );
}
