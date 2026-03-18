import { VOICE_HINTS } from "./constants";
import { VoiceButton } from "./VoiceButton";

export function VoiceHints() {
  return (
    <div className="flex gap-2">
      {VOICE_HINTS.map((hint) => (
        <VoiceButton key={hint.key} hint={hint} />
      ))}
    </div>
  );
}
