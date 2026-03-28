import { useEnigmaStore } from "../../enigma/store";
import { useCooldownStore } from "../store";
import { useCooldown } from "../useCooldown";
import { Badge } from "../../../components/ui/Badge";

export function CooldownBadge() {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const hasUnlocked = Object.values(enigmas).some((e) => e.unlocked || e.solved);
  const lastAttempt = useCooldownStore((s) => s.lastAttempt);
  const { active, label } = useCooldown(lastAttempt);

  if (!hasUnlocked) return null;

  return (
    <Badge color={active ? "danger" : "success"}>
      <span className={`w-2 h-2 rounded-full ${active ? "bg-danger" : "bg-success animate-pulse"}`} />
      <span className={`text-[0.7rem] font-semibold tracking-wide ${active ? "text-danger" : "text-success"}`}>
        {active ? label : "1 essai disponible"}
      </span>
    </Badge>
  );
}
