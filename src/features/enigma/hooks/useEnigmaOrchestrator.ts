import { useCallback } from "react";
import { useStore } from "../../../store";
import type { EnigmaLifecycleEvents } from "../types";

/**
 * Hook orchestrateur parent pour les énigmes.
 *
 * Écoute les événements lifecycle émis par les composants enfants
 * et décide des actions à exécuter en réponse (celebrate, cooldown,
 * afficher modale succès, etc.).
 *
 * L'enfant (EnigmaModal) ne sait pas ce qui se passe en réponse —
 * il se contente d'appeler onTry / onSuccess / onFail.
 */
export function useEnigmaOrchestrator(): EnigmaLifecycleEvents {
  const recordAttempt = useStore((s) => s.recordAttempt);
  const celebrate = useStore((s) => s.celebrate);
  const closeModal = useStore((s) => s.closeModal);

  const onTry = useCallback(
    (_enigmaId: string, _answer: string) => {
      // Le parent enregistre la tentative pour déclencher le cooldown
      recordAttempt();
    },
    [recordAttempt],
  );

  const onSuccess = useCallback(
    (enigmaId: string) => {
      // Fermer la modale et lancer la célébration
      closeModal();
      celebrate(enigmaId);
    },
    [closeModal, celebrate],
  );

  const onFail = useCallback(
    (_enigmaId: string) => {
      // Le parent enregistre aussi l'échec (même cooldown)
      // L'affichage du feedback erreur reste local à l'enfant
    },
    [],
  );

  const onUnlock = useCallback(
    (_enigmaId: string) => {
      // Géré par triggerUnlockEffect / UnlockOverlay
    },
    [],
  );

  const onLetterRead = useCallback(
    (_enigmaId: string) => {
      // Géré par closeLoveLetter dans le store
    },
    [],
  );

  return { onTry, onSuccess, onFail, onUnlock, onLetterRead };
}
