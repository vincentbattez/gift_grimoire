import { forwardRef, type InputHTMLAttributes } from "react";

type InputState = "default" | "success" | "danger" | "loading";

type InputProps = {
  state?: InputState;
  onSubmit?: () => void;
} & InputHTMLAttributes<HTMLInputElement>;

const STATE_BORDERS: Record<InputState, string> = {
  default: "border-[#3a2a5a] focus:border-accent focus:shadow-[0_0_14px_#9b6dff28]",
  success: "border-success shadow-[0_0_14px_#4ecca328]",
  danger: "border-danger shadow-[0_0_14px_#ff6b8a28]",
  loading: "border-accent shadow-[0_0_14px_#9b6dff40]",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { state = "default", onSubmit, className = "", onKeyDown, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      onKeyDown={(e) => {
        onKeyDown?.(e);

        if (e.defaultPrevented) {
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit?.();
        }
      }}
      className={`outline-none transition-all duration-300 font-[var(--font-cinzel)] ${STATE_BORDERS[state]} ${className}`}
      {...props}
    />
  );
});
