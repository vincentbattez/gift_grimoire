import { Badge } from "@components/ui/Badge";
import { useCooldownStore } from "@features/cooldown/store";
import { useCooldown } from "@features/cooldown/useCooldown";
import { useEnigmaStore } from "@features/enigma/store";

// eslint-disable-next-line sonarjs/function-return-type -- React component with conditional rendering
export function CooldownBadge(): React.JSX.Element | null {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const hasUnlocked = Object.values(enigmas).some((e) => e.unlocked || e.solved);
  const lastAttempt = useCooldownStore((s) => s.lastAttempt);
  const { active: isActive, label } = useCooldown(lastAttempt);

  if (!hasUnlocked) {
    return null;
  }

  return (
    <Badge color={isActive ? "danger" : "success"}>
      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-danger" : "bg-success animate-pulse"}`} />
      <span className={`text-[0.7rem] font-semibold tracking-wide ${isActive ? "text-danger" : "text-success"}`}>
        {isActive ? label : "1 essai disponible"}
      </span>
    </Badge>
  );
}
