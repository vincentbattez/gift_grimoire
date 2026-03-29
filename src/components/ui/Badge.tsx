import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  color?: "danger" | "success" | "accent";
  position?: "bottom" | "top";
  className?: string;
};

const COLOR_MAP: Record<string, { border: string; shadow: string }> = {
  danger: { border: "border-danger/30", shadow: "shadow-[0_0_20px_#ff6b8a15]" },
  success: { border: "border-success/30", shadow: "shadow-[0_0_20px_#4ecca315]" },
  accent: { border: "border-accent/30", shadow: "shadow-[0_0_20px_#9b6dff15]" },
};

export function Badge({ children, color = "accent", position = "bottom", className = "" }: BadgeProps) {
  const { border, shadow } = COLOR_MAP[color];
  const posClass = position === "bottom" ? "bottom-5" : "top-5";

  return (
    <div className={`fixed ${posClass} left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <div
        className={`flex items-center gap-2 py-2 px-4 rounded-full bg-[#1c1438]/90 border ${border} backdrop-blur-md ${shadow}`}
      >
        {children}
      </div>
    </div>
  );
}
