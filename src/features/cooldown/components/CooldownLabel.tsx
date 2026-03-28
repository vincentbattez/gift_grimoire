import { useCooldown } from "../useCooldown";

/**
 * Affiche un label de cooldown formaté HH:MM:SS.
 *
 * @param lastTriggeredAt - Timestamp du dernier déclenchement (null = inactif)
 * @param durationMs - Durée du cooldown en ms (null = jusqu'à minuit)
 * @param prefix - Texte avant le label (ex: "Reset dans")
 * @param className - Classes CSS du conteneur
 */
export function CooldownLabel({
  lastTriggeredAt,
  durationMs = null,
  prefix,
  className,
}: {
  lastTriggeredAt: number | null;
  durationMs?: number | null;
  prefix?: string;
  className?: string;
}) {
  const { active, label } = useCooldown(lastTriggeredAt, durationMs);

  if (!active) return null;

  return (
    <span className={className}>
      {prefix && <>{prefix} </>}{label}
    </span>
  );
}
