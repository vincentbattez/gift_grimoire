/** Configuration d'un cooldown */
export interface CooldownConfig {
  /** Identifiant unique du cooldown */
  key: string;
  /** Durée du cooldown en ms (null = jusqu'à minuit) */
  durationMs: number | null;
}

/** État d'un cooldown */
export interface CooldownState {
  /** Le cooldown est-il actif ? */
  active: boolean;
  /** Ms restantes avant expiration (0 si inactif) */
  remainingMs: number;
  /** Label formaté HH:MM:SS */
  label: string;
}
