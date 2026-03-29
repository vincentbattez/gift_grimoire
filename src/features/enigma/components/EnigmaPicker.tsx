import { sndClick } from "@/audio";
import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";
import { triggerUnlockEffect } from "@features/enigma/unlock";

const EXCLUDED_IDS = new Set(["Y", "F"]);

export function EnigmaPicker({ onClose }: Readonly<{ onClose?: () => void }>): React.JSX.Element {
  const enigmaStates = useEnigmaStore((s) => s.enigmas);

  const pickableList = ENIGMA_LIST.filter(
    (e) => !EXCLUDED_IDS.has(e.id) && !enigmaStates[e.id].unlocked && !enigmaStates[e.id].solved,
  );

  function handlePick(id: string): void {
    const enigma = ENIGMA_LIST.find((e) => e.id === id);

    if (enigma) {
      sndClick();
      onClose?.();

      setTimeout(() => {
        triggerUnlockEffect(enigma.id, enigma.title);
      }, 400);
    }
  }

  if (pickableList.length === 0) {
    return (
      <div className="text-muted mt-4 text-center text-xs tracking-wide">
        Toutes les énigmes éligibles sont déjà déverrouillées.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="text-gold text-[0.6rem] tracking-[0.25em] uppercase">Choisissez une énigme à déverrouiller</div>
      <div className="flex flex-wrap justify-center gap-2">
        {pickableList.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              handlePick(e.id);
            }}
            className="border-accent/40 hover:border-accent flex flex-col items-center gap-1.5 rounded-xl border bg-gradient-to-br from-[#1c1438] to-[#130f26] px-3 py-2.5 transition-all duration-150 hover:shadow-[0_0_16px_#9b6dff30] active:scale-95"
          >
            <svg
              viewBox="0 0 40 120"
              width="16"
              height="48"
              fill="none"
              className="opacity-70 drop-shadow-[0_0_6px_#e8c96a40]"
            >
              <circle cx="20" cy="16" r="12" stroke="#e8c96a" strokeWidth="3" fill="none" />
              <circle cx="20" cy="16" r="5" stroke="#e8c96a" strokeWidth="2" fill="none" />
              <line x1="20" y1="28" x2="20" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="80" x2="30" y2="80" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="90" x2="28" y2="90" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="100" x2="26" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-text text-[0.6rem] tracking-wide">Énigme {e.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
