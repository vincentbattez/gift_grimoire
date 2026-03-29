const BAR_HEIGHT_LIST = [5, 10, 15, 20, 15, 10, 5];

export function WaveformIcon({ playing, color }: { playing: boolean; color: string }): React.JSX.Element {
  return (
    <svg width="32" height="22" viewBox="0 0 26.5 20" className="overflow-visible">
      {BAR_HEIGHT_LIST.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={(20 - h) / 2}
          width="2.5"
          height={h}
          rx="1.25"
          fill={color}
          className={playing ? "" : "opacity-55"}
          style={{
            transformOrigin: `${String(i * 4 + 1.25)}px 10px`,
            ...(playing && {
              animation: "sound-bar 0.8s ease-in-out infinite",
              animationDelay: `${String(i * 90)}ms`,
            }),
          }}
        />
      ))}
    </svg>
  );
}
