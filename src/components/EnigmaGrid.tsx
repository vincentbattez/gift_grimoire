import { ENIGMAS } from "../config";
import { EnigmaCard } from "./EnigmaCard";
import { VoiceHints } from "./voice-hints/VoiceHints";

export function EnigmaGrid({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <VoiceHints />
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
        — Les Six Mystères Scellés —
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENIGMAS.map((e) => (
          <div key={e.id} data-card-id={e.id}>
            <EnigmaCard enigma={e} isAdmin={isAdmin} />
          </div>
        ))}
      </div>
    </>
  );
}
