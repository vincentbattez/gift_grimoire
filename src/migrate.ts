/**
 * Migration one-shot : distribue les données de grimoire_v3
 * (store monolithique) vers les stores par feature.
 *
 * Exécuté comme side-effect avant le rendu React.
 * Se supprime automatiquement après migration réussie.
 */
const V3_KEY = "grimoire_v3";

function migrateFromV3() {
  const raw = localStorage.getItem(V3_KEY);
  if (!raw) return;

  try {
    const { state } = JSON.parse(raw);
    if (!state) return;

    // Enigma store
    if (!localStorage.getItem("grimoire_enigma")) {
      localStorage.setItem("grimoire_enigma", JSON.stringify({
        state: {
          enigmas: state.enigmas ?? {},
          readLetters: state.readLetters ?? {},
        },
        version: 0,
      }));
    }

    // Forge global store (audio warning only)
    if (!localStorage.getItem("grimoire_forge")) {
      localStorage.setItem("grimoire_forge", JSON.stringify({
        state: {
          audioWarningAcknowledged: state.audioWarningAcknowledged ?? false,
        },
        version: 0,
      }));
    }

    // Distribute per-forge solved/revealed to individual forge stores
    const forges: Record<string, boolean> = state.forges ?? {};
    const forgeRevealed: Record<string, boolean> = state.forgeRevealed ?? {};
    for (const key of ["magnet", "scramble", "vibration", "ink"]) {
      const storeKey = `grimoire_forge_${key}`;
      if (!localStorage.getItem(storeKey)) {
        localStorage.setItem(storeKey, JSON.stringify({
          state: {
            solved: forges[key] ?? false,
            revealed: forgeRevealed[key] ?? false,
          },
          version: 0,
        }));
      }
    }

    // Cooldown store
    if (!localStorage.getItem("grimoire_cooldown")) {
      localStorage.setItem("grimoire_cooldown", JSON.stringify({
        state: {
          lastAttempt: state.lastAttempt ?? null,
          audioPlayCounts: state.audioPlayCounts ?? {},
        },
        version: 0,
      }));
    }

    // Finale store
    if (!localStorage.getItem("grimoire_finale")) {
      localStorage.setItem("grimoire_finale", JSON.stringify({
        state: {
          finaleDone: state.finaleDone ?? false,
        },
        version: 0,
      }));
    }

    localStorage.removeItem(V3_KEY);
  } catch {
    // Migration failure — ne pas supprimer les anciennes données
  }
}

// Exécution immédiate au chargement du module
migrateFromV3();
