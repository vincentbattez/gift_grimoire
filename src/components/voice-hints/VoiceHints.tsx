import { VOICE_HINT_LIST } from "./constants";
import { VoiceButton } from "./VoiceButton";

export function VoiceHints(): React.JSX.Element {
  return (
    <div className="flex gap-2">
      {VOICE_HINT_LIST.map((hint) => (
        <VoiceButton key={hint.key} hint={hint} />
      ))}
    </div>
  );
}
