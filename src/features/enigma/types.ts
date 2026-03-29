/**
 * États persistés d'une énigme (sauvegardés en localStorage).
 *
 * - `locked`    — Pas encore découverte
 * - `unlocked`  — Disponible pour tenter une réponse
 * - `solved`    — Réponse correcte validée
 * - `completed` — Lettre d'amour lue (état final)
 */
export type EnigmaPersistedStatus = "locked" | "unlocked" | "solved" | "completed";

/**
 * États transitoires d'une énigme (UI seulement, non persistés).
 *
 * - `idle`       — En attente d'interaction
 * - `attempting` — Réponse en cours d'analyse (suspense)
 * - `success`    — Réponse correcte (feedback temporaire)
 * - `fail`       — Réponse incorrecte (feedback temporaire)
 * - `cooldown`   — Essai quotidien épuisé, en attente de minuit
 */
export type EnigmaTransientStatus = "idle" | "attempting" | "success" | "fail" | "cooldown";

/** Union de tous les états possibles d'une énigme */
export type EnigmaStatus = EnigmaPersistedStatus | EnigmaTransientStatus;

/**
 * Événements du lifecycle d'une énigme, émis par le composant enfant
 * et écoutés par le composant parent (orchestrateur).
 *
 * L'enfant ne sait pas ce que le parent fera en réponse — il se contente
 * de signaler les transitions de son cycle de vie.
 */
export type EnigmaLifecycleEvents = {
  /** Déclenchée à chaque tentative de réponse */
  onTry?: (enigmaId: string, answer: string) => void;
  /** Déclenchée quand la réponse est correcte */
  onSuccess?: (enigmaId: string) => void;
  /** Déclenchée quand la réponse est incorrecte */
  onFail?: (enigmaId: string) => void;
  /** Déclenchée quand l'énigme est déverrouillée */
  onUnlock?: (enigmaId: string) => void;
  /** Déclenchée quand la lettre d'amour est lue */
  onLetterRead?: (enigmaId: string) => void;
};

/**
 * Dérive le statut complet d'une énigme à partir de l'état persisté
 * et des conditions transitoires (cooldown).
 */
export function getEnigmaStatus(
  persisted: { unlocked: boolean; solved: boolean },
  letterRead: boolean,
  attemptUsedToday: boolean,
): EnigmaPersistedStatus | "cooldown" {
  if (letterRead && persisted.solved) {
    return "completed";
  }

  if (persisted.solved) {
    return "solved";
  }

  if (!persisted.unlocked) {
    return "locked";
  }

  if (attemptUsedToday) {
    return "cooldown";
  }

  return "unlocked";
}
