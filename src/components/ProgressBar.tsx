export function ProgressBar({ progressPercentage }: Readonly<{ progressPercentage: number }>): React.JSX.Element {
  return (
    <div className="mx-auto mt-4 h-[3px] w-3/4 overflow-hidden rounded-sm bg-[#1e1530]">
      <div
        className="from-accent to-success h-full rounded-sm bg-gradient-to-r shadow-[0_0_8px_var(--color-accent)] transition-[width] duration-700 ease-out"
        style={{ width: `${String(progressPercentage)}%` }}
      />
    </div>
  );
}
