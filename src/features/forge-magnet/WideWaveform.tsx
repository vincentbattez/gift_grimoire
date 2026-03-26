const BAR_COUNT = 32;
const BAR_HEIGHTS: number[] = Array.from({ length: BAR_COUNT }, (_, i) => {
  const envelope = Math.sin((i / (BAR_COUNT - 1)) * Math.PI) * 0.55 + 0.3;
  const jitter = ((i * 17 + 3) % 11) / 11 * 0.25 - 0.1;
  return Math.max(0.12, Math.min(1, envelope + jitter));
});

export function WideWaveform({ playing, color }: { playing: boolean; color: string }) {
  const VB_W = BAR_COUNT * 9;
  const VB_H = 36;
  return (
    <svg
      width="100%"
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {BAR_HEIGHTS.map((h, i) => {
        const barH = Math.max(3, h * VB_H);
        const y = (VB_H - barH) / 2;
        return (
          <rect
            key={i}
            x={i * 9 + 1.5}
            y={y}
            width={5}
            height={barH}
            rx={2}
            fill={color}
            style={{
              transformOrigin: `${i * 9 + 4}px ${VB_H / 2}px`,
              opacity: playing ? undefined : 0.4,
              ...(playing && {
                animation: "sound-bar 0.8s ease-in-out infinite",
                animationDelay: `${(i % 10) * 70}ms`,
              }),
            }}
          />
        );
      })}
    </svg>
  );
}
