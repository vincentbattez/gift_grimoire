import { useStore } from "../../../store";
import { useCooldown } from "../useCooldown";

/**
 * Badge fixé en bas de l'écran indiquant l'état du cooldown quotidien :
 * - Vert pulsant si un essai est disponible
 * - Rouge avec countdown si l'essai est épuisé
 */
export function CooldownBadge() {
  const enigmas = useStore((s) => s.enigmas);
  const hasUnlocked = Object.values(enigmas).some((e) => e.unlocked || e.solved);
  const lastAttempt = useStore((s) => s.lastAttempt);
  const { active, label } = useCooldown(lastAttempt);

  if (!hasUnlocked) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      {active ? (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#1c1438]/90 border border-danger/30 backdrop-blur-md shadow-[0_0_20px_#ff6b8a15]">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-[0.7rem] text-danger font-semibold tracking-wide">
            {label}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#1c1438]/90 border border-success/30 backdrop-blur-md shadow-[0_0_20px_#4ecca315]">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[0.7rem] text-success font-semibold tracking-wide">
            1 essai disponible
          </span>
        </div>
      )}
    </div>
  );
}
