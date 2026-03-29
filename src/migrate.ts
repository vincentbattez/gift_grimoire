/**
 * Migration one-shot : distribue les données de grimoire_v3
 * (store monolithique) vers les stores par feature.
 *
 * Exécuté comme side-effect avant le rendu React.
 * Se supprime automatiquement après migration réussie.
 */
const V3_KEY = "grimoire_v3";

type V3State = {
  enigmas?: Record<string, unknown>;
  readLetters?: Record<string, boolean>;
  audioWarningAcknowledged?: boolean;
  forges?: Record<string, boolean>;
  forgeRevealed?: Record<string, boolean>;
  lastAttempt?: number | null;
  audioPlayCounts?: Record<string, number>;
  finaleDone?: boolean;
};

type PersistedStore = {
  state?: V3State;
  version?: number;
};

function migrateFromV3() {
  const raw = localStorage.getItem(V3_KEY);

  if (!raw) {
    return;
  }

  try {
    const { state } = JSON.parse(raw) as PersistedStore;

    if (!state) {
      return;
    }

    // Enigma store
    if (!localStorage.getItem("grimoire_enigma")) {
      localStorage.setItem(
        "grimoire_enigma",
        JSON.stringify({
          state: {
            enigmas: state.enigmas ?? {},
            readLetters: state.readLetters ?? {},
          },
          version: 0,
        }),
      );
    }

    // Forge global store (audio warning only)
    if (!localStorage.getItem("grimoire_forge")) {
      localStorage.setItem(
        "grimoire_forge",
        JSON.stringify({
          state: {
            audioWarningAcknowledged: state.audioWarningAcknowledged ?? false,
          },
          version: 0,
        }),
      );
    }

    // Distribute per-forge solved/revealed to individual forge stores
    // Merge with existing state to avoid losing v3 data when the key already exists
    const forges: Record<string, boolean> = state.forges ?? {};
    const forgeRevealed: Record<string, boolean> = state.forgeRevealed ?? {};
    for (const key of ["magnet", "scramble", "vibration", "ink"]) {
      const storeKey = `grimoire_forge_${key}`;
      const v3Fields = {
        solved: forges[key] ?? false,
        revealed: forgeRevealed[key] ?? false,
      };
      const existing = localStorage.getItem(storeKey);

      if (existing) {
        try {
          const parsed = JSON.parse(existing) as PersistedStore;
          const merged = { ...v3Fields, ...parsed.state };
          parsed.state = merged;
          localStorage.setItem(storeKey, JSON.stringify(parsed));
        } catch {
          /* malformed JSON — overwrite below */
        }
      } else {
        localStorage.setItem(
          storeKey,
          JSON.stringify({
            state: v3Fields,
            version: 0,
          }),
        );
      }
    }

    // Cooldown store
    if (!localStorage.getItem("grimoire_cooldown")) {
      localStorage.setItem(
        "grimoire_cooldown",
        JSON.stringify({
          state: {
            lastAttempt: state.lastAttempt ?? null,
            audioPlayCounts: state.audioPlayCounts ?? {},
          },
          version: 0,
        }),
      );
    }

    // Finale store
    if (!localStorage.getItem("grimoire_finale")) {
      localStorage.setItem(
        "grimoire_finale",
        JSON.stringify({
          state: {
            finaleDone: state.finaleDone ?? false,
          },
          version: 0,
        }),
      );
    }

    localStorage.removeItem(V3_KEY);
  } catch {
    // Migration failure — ne pas supprimer les anciennes données
  }
}

// Exécution immédiate au chargement du module
migrateFromV3();
