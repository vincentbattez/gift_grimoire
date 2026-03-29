/** État d'un cooldown */
export type CooldownState = {
  /** Le cooldown est-il actif ? */
  active: boolean;
  /** Ms restantes avant expiration (0 si inactif) */
  remainingMs: number;
  /** Label formaté HH:MM:SS */
  label: string;
};
