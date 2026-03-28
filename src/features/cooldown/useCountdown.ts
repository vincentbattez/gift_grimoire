import { useCooldown } from "./useCooldown";

/**
 * Wrapper de commodité : retourne un label HH:MM:SS du cooldown quotidien.
 * Utilise `useCooldown` en interne avec un timestamp artificiel « aujourd'hui ».
 *
 * @deprecated Préférer `useCooldown(lastTriggeredAt)` pour un contrôle complet.
 */
export function useCountdown(): string {
  // Force le cooldown actif (timestamp = maintenant → même jour = actif)
  const { label } = useCooldown(Date.now());
  return label;
}
