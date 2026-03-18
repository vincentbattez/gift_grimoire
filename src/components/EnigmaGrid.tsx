import { ENIGMAS } from "../config";
import { EnigmaCard } from "./EnigmaCard";
import { LetterScramble } from "./LetterScramble";
import { VoiceHints } from "./voice-hints/VoiceHints";
import { DarkVadorButton } from "./DarkVadorButton";

export function EnigmaGrid({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
        — L'Art et sa Curiosité —
      </div>
      <VoiceHints />
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase mt-16">
        — Le Maillon des Égarés —
      </div>
      <LetterScramble />
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase mt-16">
        — L'Énigme de l'Aimant —
      </div>
      <DarkVadorButton />
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase mt-16">
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
