const CORNER_SVG = (
  <svg viewBox="0 0 32 32">
    <path
      d="M2 2 L2 14 Q2 8 8 8 L2 8 M2 2 L14 2 Q8 2 8 8 L8 2"
      stroke="#6b4226"
      fill="none"
      strokeWidth="1.5"
    />
    <circle cx="4" cy="4" r="2" fill="#b8860b" opacity="0.6" />
  </svg>
);

export function CornerOrnaments() {
  return (
    <>
      <div className="corner corner-tl">{CORNER_SVG}</div>
      <div className="corner corner-tr">{CORNER_SVG}</div>
      <div className="corner corner-bl">{CORNER_SVG}</div>
      <div className="corner corner-br">{CORNER_SVG}</div>
    </>
  );
}
