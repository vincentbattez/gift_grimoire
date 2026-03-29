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
