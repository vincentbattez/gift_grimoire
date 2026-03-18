import { sndClick } from "../audio";
import { triggerUnlockEffect } from "../unlock";
import { ENIGMAS } from "../config";
import { useStore } from "../store";

const EXCLUDED_IDS = new Set(["Y", "F"]);

export function EnigmaPicker({ onClose }: { onClose?: () => void }) {
  const enigmaStates = useStore((s) => s.enigmas);

  const pickable = ENIGMAS.filter(
    (e) =>
      !EXCLUDED_IDS.has(e.id) &&
      !enigmaStates[e.id]?.unlocked &&
      !enigmaStates[e.id]?.solved,
  );

  function handlePick(id: string) {
    const enigma = ENIGMAS.find((e) => e.id === id);
    if (enigma) {
      sndClick();
      onClose?.();
      setTimeout(() => triggerUnlockEffect(enigma.id, enigma.title), 400);
    }
  }

  if (pickable.length === 0) {
    return (
      <div className="mt-4 text-center text-xs text-muted tracking-wide">
        Toutes les énigmes éligibles sont déjà déverrouillées.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="text-[0.6rem] tracking-[0.25em] text-gold uppercase">
        Choisissez une énigme à déverrouiller
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {pickable.map((e) => (
          <button
            key={e.id}
            onClick={() => handlePick(e.id)}
            className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl
              border border-accent/40 bg-gradient-to-br from-[#1c1438] to-[#130f26]
              active:scale-95 transition-all duration-150
              hover:border-accent hover:shadow-[0_0_16px_#9b6dff30]"
          >
            <svg viewBox="0 0 40 120" width="16" height="48" fill="none" className="opacity-70 drop-shadow-[0_0_6px_#e8c96a40]">
              <circle cx="20" cy="16" r="12" stroke="#e8c96a" strokeWidth="3" fill="none" />
              <circle cx="20" cy="16" r="5" stroke="#e8c96a" strokeWidth="2" fill="none" />
              <line x1="20" y1="28" x2="20" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="80" x2="30" y2="80" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="90" x2="28" y2="90" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="100" x2="26" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-[0.6rem] text-text tracking-wide">
              Énigme {e.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
