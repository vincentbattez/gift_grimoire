type OrnamentDividerProps = {
  color?: string;
  className?: string;
  lineWidth?: "flex" | "fixed";
};

/* eslint-disable @typescript-eslint/no-useless-default-assignment -- defaults required for optional props */
export function OrnamentDivider({
  color = "#c9a032",
  className = "",
  lineWidth = "flex",
}: Readonly<OrnamentDividerProps>): React.JSX.Element {
  /* eslint-enable @typescript-eslint/no-useless-default-assignment */
  const lineClass = lineWidth === "flex" ? "flex-1" : "w-10";
  const fadeColor = `${color}40`;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className={`h-px ${lineClass}`}
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${fadeColor})` }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}, ${fadeColor})` }}
      />
      <div
        className={`h-px ${lineClass}`}
        style={{ backgroundImage: `linear-gradient(to left, transparent, ${fadeColor})` }}
      />
    </div>
  );
}
