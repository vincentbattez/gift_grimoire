import { ENIGMAS } from "../config";
import { EnigmaCard } from "./EnigmaCard";

export function EnigmaGrid() {
  return (
    <>
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
        — Les Six Énigmes —
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENIGMAS.map((e) => (
          <div key={e.id} data-card-id={e.id}>
            <EnigmaCard enigma={e} />
          </div>
        ))}
      </div>
    </>
  );
}
