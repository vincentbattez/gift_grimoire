import { useCallback } from "react";
import { useCooldownStore } from "@features/cooldown/store";
import { useEnigmaStore } from "@features/enigma/store";
import type { EnigmaLifecycleEvents } from "@features/enigma/types";

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
  const recordAttempt = useCooldownStore((s) => s.recordAttempt);
  const celebrate = useEnigmaStore((s) => s.celebrate);
  const closeModal = useEnigmaStore((s) => s.closeModal);

  const onTry = useCallback(() => {
    recordAttempt();
  }, [recordAttempt]);

  const onSuccess = useCallback(
    (enigmaId: string) => {
      closeModal();
      celebrate(enigmaId);
    },
    [closeModal, celebrate],
  );

  return { onTry, onSuccess };
}
