import type { Ref } from "react";

type LockIconProps = {
  /** Unique prefix for SVG defs IDs (avoids clashes when multiple instances exist) */
  readonly id?: string;
  /** SVG pixel width — default 36 */
  readonly width?: number;
  /** SVG pixel height — default 43 */
  readonly height?: number;
  /** Show orbiting rune particleList — default true */
  readonly orbit?: boolean;
  /** Allow burst/glow to render outside SVG bounds — default false */
  readonly overflow?: boolean;
  /** Ref on the SVG element */
  readonly svgRef?: Ref<SVGSVGElement>;
  /** Ref on the keyhole glow circle */
  readonly keyholeRef?: Ref<SVGCircleElement>;
  /** Unlock-specific state — when set, enables unlock animation classes */
  readonly unlock?: {
    phase: "drag" | "unlocking" | "done";
    proximity: number;
  };
};

/* eslint-disable @typescript-eslint/no-useless-default-assignment -- defaults required for optional props */
export function LockIcon({
  id = "lock",
  width = 36,
  height = 43,
  orbit = true,
  overflow = false,
  svgRef,
  keyholeRef,
  unlock,
}: LockIconProps): React.JSX.Element {
  /* eslint-enable @typescript-eslint/no-useless-default-assignment */
  const isUnlocking = unlock?.phase === "unlocking";
  const isDone = unlock?.phase === "done";
  const proximity = unlock?.proximity ?? 0;

  const openingClass = isUnlocking || isDone ? "is-opening" : "";
  const shackleClass = unlock ? `unlock-shackle ${openingClass}` : "lock-shackle";

  const reactingClass = isUnlocking ? "is-reacting" : "";
  const dissolvingClass = isDone ? "is-dissolving" : "";
  const bodyClass = unlock ? `unlock-body ${reactingClass} ${dissolvingClass}` : undefined;

  return (
    <div className="lock-icon-wrapper">
      {orbit && (
        <div className="lock-orbit">
          <div className="lock-orbit-dot" style={{ "--i": 0 } as React.CSSProperties} />
          <div className="lock-orbit-dot" style={{ "--i": 1 } as React.CSSProperties} />
          <div className="lock-orbit-dot" style={{ "--i": 2 } as React.CSSProperties} />
        </div>
      )}

      <svg
        ref={svgRef}
        className={unlock ? "unlock-lock-svg" : "lock-svg"}
        viewBox="0 0 40 48"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...(overflow && { overflow: "visible" })}
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="4" y1="20" x2="36" y2="48">
            <stop offset="0%" stopColor="#1a1535" />
            <stop offset="100%" stopColor="#0d0a1a" />
          </linearGradient>
          <radialGradient id={`${id}-keyholeGlow`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#9b6dff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9b6dff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${id}-bodyClip`}>
            <rect x="5" y="20" width="30" height="24" rx="5" />
          </clipPath>
          {unlock && (
            <filter id={`${id}-bigGlow`}>
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Shackle */}
        <path
          className={shackleClass}
          d="M11 20 V14 A9 9 0 0 1 29 14 V20"
          stroke="#5a4f6a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <rect
          className={bodyClass}
          x="5"
          y="20"
          width="30"
          height="24"
          rx="5"
          fill={`url(#${id}-body)`}
          stroke="#3a2f55"
          strokeWidth="1"
        />

        {/* Keyhole — clipped to body */}
        <g clipPath={`url(#${id}-bodyClip)`}>
          <circle
            ref={keyholeRef}
            cx="20"
            cy="32"
            r="8"
            fill={`url(#${id}-keyholeGlow)`}
            className="lock-keyhole-glow"
            style={unlock ? { opacity: 0.3 + proximity * 0.7 } : undefined}
          />
          <g style={unlock ? { opacity: 0.6 + proximity * 0.4 } : undefined}>
            <circle cx="20" cy="30" r="3" fill="#9b6dff" className="lock-keyhole" />
            <path d="M18.5 32 L20 40 L21.5 32" fill="#9b6dff" className="lock-keyhole" />
          </g>
        </g>

        {/* Burst flash (unlock only) */}
        {unlock && (
          <circle
            className={`unlock-burst ${isDone ? "is-bursting" : ""}`}
            cx="20"
            cy="28"
            r="30"
            fill="#9b6dff"
            opacity="0"
            filter={`url(#${id}-bigGlow)`}
          />
        )}
      </svg>
    </div>
  );
}
