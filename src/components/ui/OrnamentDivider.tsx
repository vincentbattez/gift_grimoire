interface OrnamentDividerProps {
  color?: string;
  className?: string;
  lineWidth?: "flex" | "fixed";
}

export function OrnamentDivider({
  color = "#c9a032",
  className = "",
  lineWidth = "flex",
}: OrnamentDividerProps) {
  const lineClass = lineWidth === "flex" ? "flex-1" : "w-10";
  const fadeColor = `${color}40`;
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className={`h-px ${lineClass}`} style={{ backgroundImage: `linear-gradient(to right, transparent, ${fadeColor})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }} />
      <div className={`h-px ${lineClass}`} style={{ backgroundImage: `linear-gradient(to left, transparent, ${fadeColor})` }} />
    </div>
  );
}
