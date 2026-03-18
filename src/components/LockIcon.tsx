export function LockIcon() {
  return (
    <div className="lock-icon-wrapper">
      {/* Orbiting rune particles */}
      <div className="lock-orbit">
        <div className="lock-orbit-dot" style={{ "--i": 0 } as React.CSSProperties} />
        <div className="lock-orbit-dot" style={{ "--i": 1 } as React.CSSProperties} />
        <div className="lock-orbit-dot" style={{ "--i": 2 } as React.CSSProperties} />
      </div>

      <svg
        className="lock-svg"
        viewBox="0 0 40 48"
        width="36"
        height="43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lockBody" x1="4" y1="20" x2="36" y2="48">
            <stop offset="0%" stopColor="#2a1f4e" />
            <stop offset="100%" stopColor="#150e2e" />
          </linearGradient>
          <radialGradient id="keyholeGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#9b6dff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9b6dff" stopOpacity="0" />
          </radialGradient>
          <filter id="lockGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shackle */}
        <path
          className="lock-shackle"
          d="M11 20 V14 A9 9 0 0 1 29 14 V20"
          stroke="#5a4f6a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <rect
          x="5"
          y="20"
          width="30"
          height="24"
          rx="5"
          fill="url(#lockBody)"
          stroke="#5a4f6a"
          strokeWidth="1.5"
        />

        {/* Keyhole glow background */}
        <circle cx="20" cy="32" r="8" fill="url(#keyholeGlow)" className="lock-keyhole-glow" />

        {/* Keyhole */}
        <g filter="url(#lockGlow)">
          <circle cx="20" cy="30" r="3" fill="#9b6dff" className="lock-keyhole" />
          <path d="M18.5 32 L20 40 L21.5 32" fill="#9b6dff" className="lock-keyhole" />
        </g>
      </svg>
    </div>
  );
}
