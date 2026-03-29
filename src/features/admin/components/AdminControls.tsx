import { useCooldownStore } from "@features/cooldown/store";
import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";
import type { EnigmaPersistedStatus } from "@features/enigma/types";
import { FORGE_LIST } from "@features/forges/forges.config";

const STATUS_LIST: EnigmaPersistedStatus[] = ["locked", "unlocked", "solved", "completed"];

const STATUS_STYLE: Record<EnigmaPersistedStatus, string> = {
  locked: "border-muted/30 text-muted/50 bg-muted/5",
  unlocked: "border-accent/30 text-accent/50 bg-accent/5",
  solved: "border-success/30 text-success/50 bg-success/5",
  completed: "border-gold/30 text-gold/50 bg-gold/5",
};

function getEnigmaCurrentStatus(
  enigma: { unlocked: boolean; solved: boolean },
  letterRead: boolean,
): EnigmaPersistedStatus {
  if (letterRead && enigma.solved) {
    return "completed";
  }

  if (enigma.solved) {
    return "solved";
  }

  if (enigma.unlocked) {
    return "unlocked";
  }

  return "locked";
}

/**
 * Panneau admin consolidé :
 * - Unlock all / Solve all (raccourcis)
 * - Setter d'état par énigme
 * - Reset cooldown timer
 */
export function AdminControls(): React.JSX.Element {
  const setEnigmaStatus = useEnigmaStore((s) => s.setEnigmaStatus);
  const resetAttempt = useCooldownStore((s) => s.resetAttempt);
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const readLetters = useEnigmaStore((s) => s.readLetters);

  return (
    <div className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
      <div className="mb-3 text-center text-[0.5rem] tracking-[0.2em] text-amber-400/60 uppercase">Admin Panel</div>

      {/* Raccourcis globaux */}
      <div className="mb-4 flex justify-center gap-2">
        <button
          onClick={() => {
            const { unlock } = useEnigmaStore.getState();

            ENIGMA_LIST.forEach((e) => {
              unlock(e.id);
            });
          }}
          className="border-accent/30 text-accent/60 hover:text-accent hover:border-accent/60 bg-accent/5 cursor-pointer rounded-md border px-3 py-1 text-[0.55rem] transition-colors"
        >
          unlock all
        </button>
        <button
          onClick={() => {
            const es = useEnigmaStore.getState();

            ENIGMA_LIST.forEach((e) => {
              es.unlock(e.id);
              es.solve(e.id);
            });

            FORGE_LIST.forEach((f) => {
              f.solve();
              f.reveal();
            });
          }}
          className="border-success/30 text-success/60 hover:text-success hover:border-success/60 bg-success/5 cursor-pointer rounded-md border px-3 py-1 text-[0.55rem] transition-colors"
        >
          solve all
        </button>
        <button
          onClick={() => {
            resetAttempt();
          }}
          className="cursor-pointer rounded-md border border-sky-400/30 bg-sky-400/5 px-3 py-1 text-[0.55rem] text-sky-400/60 transition-colors hover:border-sky-400/60 hover:text-sky-400"
        >
          reset timer
        </button>
      </div>

      {/* Setter d'état par énigme */}
      <div className="space-y-2">
        {ENIGMA_LIST.map((e) => {
          const state = enigmas[e.id];

          const current = getEnigmaCurrentStatus(state, readLetters[e.id]);

          return (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-muted/60 w-16 shrink-0 truncate text-[0.55rem]">
                {e.icon} {e.id}
              </span>
              <div className="flex flex-wrap gap-1">
                {STATUS_LIST.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setEnigmaStatus(e.id, status);
                    }}
                    className={`cursor-pointer rounded border px-2 py-0.5 text-[0.45rem] tracking-[0.1em] uppercase transition-all ${
                      current === status
                        ? `${STATUS_STYLE[status]} font-bold`
                        : "border-muted/15 text-muted/30 hover:border-muted/40 hover:text-muted/50 bg-transparent"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
