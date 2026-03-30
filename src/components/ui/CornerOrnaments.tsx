type CornerOrnamentsProps = {
  color?: string;
  size?: string;
  offset?: string;
  opacity?: string;
  className?: string;
  cornerList?: ("tl" | "tr" | "bl" | "br")[];
};

export function CornerOrnaments({
  color = "border-accent",
  size = "w-2 h-2",
  offset = "6px",
  opacity = "opacity-35",
  className = "",
  cornerList = ["tl", "tr", "bl", "br"],
}: Readonly<CornerOrnamentsProps>): React.JSX.Element {
  const base = `absolute ${size} ${opacity} ${color} ${className}`;

  return (
    <>
      {}
      {cornerList.includes("tl") && (
        <div className={`${base} border-t border-l`} style={{ top: offset, left: offset }} />
      )}
      {cornerList.includes("tr") && (
        <div className={`${base} border-t border-r`} style={{ top: offset, right: offset }} />
      )}
      {cornerList.includes("bl") && (
        <div className={`${base} border-b border-l`} style={{ bottom: offset, left: offset }} />
      )}
      {cornerList.includes("br") && (
        <div className={`${base} border-r border-b`} style={{ bottom: offset, right: offset }} />
      )}
      {}
    </>
  );
}
