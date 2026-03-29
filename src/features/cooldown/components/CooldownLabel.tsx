import { useCooldown } from "@features/cooldown/useCooldown";

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
}: Readonly<{
  lastTriggeredAt: number | null;
  durationMs?: number | null;
  prefix?: string;
  className?: string;
}>): React.JSX.Element | null {
  const { active: isActive, label } = useCooldown(lastTriggeredAt, durationMs);

  if (!isActive) {
    return null;
  }

  return (
    <span className={className}>
      {prefix && <>{prefix} </>}
      {label}
    </span>
  );
}
