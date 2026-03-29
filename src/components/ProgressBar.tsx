export function ProgressBar({ progressPercentage }: { progressPercentage: number }): React.JSX.Element {
  return (
    <div className="mx-auto mt-4 w-3/4 h-[3px] bg-[#1e1530] rounded-sm overflow-hidden">
      <div
        className="h-full rounded-sm bg-gradient-to-r from-accent to-success shadow-[0_0_8px_var(--color-accent)] transition-[width] duration-700 ease-out"
        style={{ width: `${String(progressPercentage)}%` }}
      />
    </div>
  );
}
