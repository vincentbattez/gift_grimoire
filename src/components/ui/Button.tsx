import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "gradient" | "ghost" | "icon" | "admin";
type ButtonColor = "accent" | "success" | "danger" | "sky" | "amber";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const COLOR_MAP: Record<
  ButtonColor,
  { border: string; text: string; bg: string; hoverBorder: string; hoverText: string; hoverBg: string }
> = {
  accent: {
    border: "border-accent/30",
    text: "text-accent/50",
    bg: "bg-accent/5",
    hoverBorder: "hover:border-accent/60",
    hoverText: "hover:text-accent/80",
    hoverBg: "hover:bg-accent/10",
  },
  success: {
    border: "border-success/30",
    text: "text-success/50",
    bg: "bg-success/5",
    hoverBorder: "hover:border-success/60",
    hoverText: "hover:text-success/80",
    hoverBg: "hover:bg-success/10",
  },
  danger: {
    border: "border-danger/30",
    text: "text-danger/50",
    bg: "bg-danger/5",
    hoverBorder: "hover:border-danger/60",
    hoverText: "hover:text-danger/80",
    hoverBg: "hover:bg-danger/10",
  },
  sky: {
    border: "border-sky-400/30",
    text: "text-sky-400/50",
    bg: "bg-sky-400/5",
    hoverBorder: "hover:border-sky-400/60",
    hoverText: "hover:text-sky-400/80",
    hoverBg: "hover:bg-sky-400/10",
  },
  amber: {
    border: "border-amber-400/30",
    text: "text-amber-400/50",
    bg: "bg-amber-400/5",
    hoverBorder: "hover:border-amber-400/60",
    hoverText: "hover:text-amber-400/80",
    hoverBg: "hover:bg-amber-400/10",
  },
};

export function Button({
  variant = "primary",
  color = "accent",
  size = "md",
  className = "",
  ...props
}: ButtonProps): React.JSX.Element {
  if (variant === "admin") {
    const colorStyles = COLOR_MAP[color];

    return (
      <button
        className={`rounded-md border px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase ${colorStyles.border} ${colorStyles.text} ${colorStyles.bg} ${colorStyles.hoverBorder} ${colorStyles.hoverText} ${colorStyles.hoverBg} transition-all duration-150 active:scale-95 ${className}`}
        {...props}
      />
    );
  }

  if (variant === "primary") {
    const colorClasses: Record<ButtonColor, string> = {
      accent: "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20",
      success: "border-success/40 bg-success/10 text-success hover:bg-success/20",
      danger: "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
      sky: "border-sky-400/40 bg-sky-400/10 text-sky-400 hover:bg-sky-400/20",
      amber: "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20",
    };
    const sizeClasses: Record<ButtonSize, string> = {
      sm: "py-2 px-5 text-[0.7rem]",
      md: "py-3 px-8 text-[0.78rem]",
      lg: "py-3.5 px-10 text-[0.8rem]",
    };

    return (
      <button
        className={`cursor-pointer rounded-full border font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 active:scale-95 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }

  if (variant === "ghost") {
    return (
      <button
        className={`text-muted/50 cursor-pointer border-none bg-transparent tracking-[0.1em] uppercase ${className}`}
        {...props}
      />
    );
  }

  if (variant === "icon") {
    return (
      <button
        className={`flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border bg-white/4 transition-colors ${className}`}
        {...props}
      />
    );
  }

  // gradient
  const gradientColors: Record<ButtonColor, string> = {
    accent: "bg-gradient-to-br from-[#6b4a97] to-accent shadow-[0_4px_22px_#9b6dff28]",
    success: "bg-gradient-to-br from-[#2a6a4a] to-success shadow-[0_4px_22px_#4ecca328]",
    danger: "bg-gradient-to-br from-[#6a2a2a] to-danger shadow-[0_4px_22px_#ff6b8a28]",
    sky: "bg-gradient-to-br from-[#2a4a6a] to-sky-400 shadow-[0_4px_22px_#38bdf828]",
    amber: "bg-gradient-to-br from-[#6a4a2a] to-amber-400 shadow-[0_4px_22px_#f59e0b28]",
  };
  const gradientSizeClasses: Record<ButtonSize, string> = {
    sm: "py-2 px-5 text-[0.7rem]",
    md: "py-3 px-8 text-[0.82rem]",
    lg: "py-4 px-8 text-[0.85rem]",
  };

  return (
    <button
      className={`cursor-pointer rounded-[14px] border-none font-[var(--font-cinzel)] font-semibold tracking-[0.12em] text-white uppercase transition-all duration-200 active:scale-[0.97] ${gradientColors[color]} ${gradientSizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
