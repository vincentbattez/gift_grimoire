interface CornerOrnamentsProps {
  color?: string;
  size?: string;
  offset?: string;
  opacity?: string;
  className?: string;
  corners?: ("tl" | "tr" | "bl" | "br")[];
}

export function CornerOrnaments({
  color = "border-accent",
  size = "w-2 h-2",
  offset = "6px",
  opacity = "opacity-35",
  className = "",
  corners = ["tl", "tr", "bl", "br"],
}: CornerOrnamentsProps) {
  const base = `absolute ${size} ${opacity} ${color} ${className}`;
  return (
    <>
      {corners.includes("tl") && <div className={`${base} border-t border-l`} style={{ top: offset, left: offset }} />}
      {corners.includes("tr") && <div className={`${base} border-t border-r`} style={{ top: offset, right: offset }} />}
      {corners.includes("bl") && <div className={`${base} border-b border-l`} style={{ bottom: offset, left: offset }} />}
      {corners.includes("br") && <div className={`${base} border-b border-r`} style={{ bottom: offset, right: offset }} />}
    </>
  );
}
