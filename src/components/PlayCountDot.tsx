type Props = {
  total: number;
  remaining: number;
  /** Color when available (default: accent) */
  activeClass?: string;
  /** Color when used up (default: white/8) */
  inactiveClass?: string;
  /** Color when section is solved (overrides active) */
  solvedClass?: string;
  /** Whether the section is solved — default false */
  solved?: boolean;
};

export function PlayCountDot({
  total,
  remaining,
  activeClass = "bg-accent/45",
  inactiveClass = "bg-white/8",
  solvedClass = "bg-success/50",
  solved = false,
}: Readonly<Props>): React.JSX.Element {
  const getDotClass = (i: number): string => {
    if (solved) {
      return solvedClass;
    }

    if (i < remaining) {
      return activeClass;
    }

    return inactiveClass;
  };

  return (
    <div className="relative flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${getDotClass(i)}`} />
      ))}
    </div>
  );
}
