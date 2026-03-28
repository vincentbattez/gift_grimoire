import { useStore } from "../../../store";
import { ENIGMAS } from "../../enigma/config";
import { FORGES } from "../../forges/forges.config";
import type { EnigmaPersistedStatus } from "../../enigma/types";

const STATUSES: EnigmaPersistedStatus[] = ["locked", "unlocked", "solved", "completed"];

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
  if (letterRead && enigma.solved) return "completed";
  if (enigma.solved) return "solved";
  if (enigma.unlocked) return "unlocked";
  return "locked";
}

/**
 * Panneau admin consolidé :
 * - Unlock all / Solve all (raccourcis)
 * - Setter d'état par énigme
 * - Reset cooldown timer
 */
export function AdminControls() {
  const setEnigmaStatus = useStore((s) => s.setEnigmaStatus);
  const resetAttempt = useStore((s) => s.resetAttempt);
  const enigmas = useStore((s) => s.enigmas);
  const readLetters = useStore((s) => s.readLetters);

  return (
    <div className="mb-6 p-3 rounded-xl border border-amber-400/20 bg-amber-400/5">
      <div className="text-center text-[0.5rem] tracking-[0.2em] text-amber-400/60 uppercase mb-3">
        Admin Panel
      </div>

      {/* Raccourcis globaux */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={() => {
            const { unlock } = useStore.getState();
            ENIGMAS.forEach((e) => unlock(e.id));
          }}
          className="px-3 py-1 text-[0.55rem] rounded-md border border-accent/30 text-accent/60 hover:text-accent hover:border-accent/60 bg-accent/5 transition-colors cursor-pointer"
        >
          unlock all
        </button>
        <button
          onClick={() => {
            const s = useStore.getState();
            ENIGMAS.forEach((e) => { s.unlock(e.id); s.solve(e.id); });
            FORGES.forEach((f) => { s.solveForge(f.key); s.revealForge(f.key); });
          }}
          className="px-3 py-1 text-[0.55rem] rounded-md border border-success/30 text-success/60 hover:text-success hover:border-success/60 bg-success/5 transition-colors cursor-pointer"
        >
          solve all
        </button>
        <button
          onClick={() => resetAttempt()}
          className="px-3 py-1 text-[0.55rem] rounded-md border border-sky-400/30 text-sky-400/60 hover:text-sky-400 hover:border-sky-400/60 bg-sky-400/5 transition-colors cursor-pointer"
        >
          reset timer
        </button>
      </div>

      {/* Setter d'état par énigme */}
      <div className="space-y-2">
        {ENIGMAS.map((e) => {
          const state = enigmas[e.id];
          if (!state) return null;
          const current = getEnigmaCurrentStatus(state, !!readLetters[e.id]);

          return (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-[0.55rem] text-muted/60 w-16 shrink-0 truncate">
                {e.icon} {e.id}
              </span>
              <div className="flex gap-1 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setEnigmaStatus(e.id, status)}
                    className={`px-2 py-0.5 text-[0.45rem] rounded tracking-[0.1em] uppercase border transition-all cursor-pointer ${
                      current === status
                        ? STATUS_STYLE[status] + " font-bold"
                        : "border-muted/15 text-muted/30 bg-transparent hover:border-muted/40 hover:text-muted/50"
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
