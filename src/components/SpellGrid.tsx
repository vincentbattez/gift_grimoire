import { ENIGMAS } from "../config";
import { SpellCard } from "./SpellCard";

export function SpellGrid() {
  return (
    <>
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
        — Les Six Sorts —
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENIGMAS.map((e) => (
          <div key={e.id} data-card-id={e.id}>
            <SpellCard enigma={e} />
          </div>
        ))}
      </div>
    </>
  );
}
