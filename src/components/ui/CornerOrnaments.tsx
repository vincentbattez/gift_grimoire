type CornerOrnamentsProps = {
  color?: string;
  size?: string;
  offset?: string;
  opacity?: string;
  className?: string;
  cornerList?: ("tl" | "tr" | "bl" | "br")[];
};

/* eslint-disable @typescript-eslint/no-useless-default-assignment -- defaults required for optional props */
export function CornerOrnaments({
  color = "border-accent",
  size = "w-2 h-2",
  offset = "6px",
  opacity = "opacity-35",
  className = "",
  cornerList = ["tl", "tr", "bl", "br"],
}: Readonly<CornerOrnamentsProps>): React.JSX.Element {
  /* eslint-enable @typescript-eslint/no-useless-default-assignment */
  const base = `absolute ${size} ${opacity} ${color} ${className}`;

  return (
    <>
      {/* eslint-disable sonarjs/argument-type -- dynamic class string is valid */}
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
      {/* eslint-enable sonarjs/argument-type */}
    </>
  );
}
