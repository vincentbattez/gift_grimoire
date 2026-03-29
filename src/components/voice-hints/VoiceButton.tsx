import { useState } from "react";
import { AudioWarningModal } from "@components/AudioWarningModal";
import { LastAttemptModal } from "@components/LastAttemptModal";
import { PlayCountDot } from "@components/PlayCountDot";
import { CornerOrnaments } from "@components/ui/CornerOrnaments";
import { useCooldownStore } from "@features/cooldown/store";
import { useEnigmaStore } from "@features/enigma/store";
import { useForgeStore } from "@features/forges/store";
import { MAX_PLAYS, type VoiceHint } from "./constants";
import { WaveformIcon } from "./WaveformIcon";

export function VoiceButton({ hint }: Readonly<{ hint: VoiceHint }>): React.JSX.Element {
  const count = useCooldownStore((s) => s.audioPlayCounts[hint.key] ?? 0);
  const incrementAudioPlay = useCooldownStore((s) => s.incrementAudioPlay);
  const hasAudioWarningAcknowledged = useForgeStore((s) => s.audioWarningAcknowledged);
  const hasAnyUnlocked = useEnigmaStore((s) => Object.values(s.enigmas).some((e) => e.unlocked || e.solved));

  const remaining = MAX_PLAYS - count;
  const isLastAttempt = remaining === 1;
  const isSuccess = hasAnyUnlocked;
  const isExhausted = remaining <= 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const [isShowingLastAttempt, setIsShowingLastAttempt] = useState(false);

  async function playAudio(): Promise<void> {
    const audio = new Audio(hint.src);
    setIsPlaying(true);

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    try {
      await audio.play();
      incrementAudioPlay(hint.key);
    } catch {
      setIsPlaying(false);
    }
  }

  function confirmAndPlay(): void {
    if (isLastAttempt) {
      setIsShowingLastAttempt(true);

      return;
    }
    void playAudio();
  }

  function handlePlay(): void {
    if (isExhausted || isPlaying) {
      return;
    }

    if (!hasAudioWarningAcknowledged) {
      setIsShowingWarning(true);

      return;
    }
    confirmAndPlay();
  }

  // ── visual states ──
  const accentColor = isSuccess ? "var(--color-success)" : "var(--color-accent)";

  const borderClass = (() => {
    if (isSuccess) {
      return "border-solved-border/50 shadow-[0_0_22px_#4ecca325]";
    }

    if (isPlaying) {
      return "border-accent/50 shadow-[0_0_20px_#9b6dff25]";
    }

    if (isExhausted) {
      return "border-white/5 opacity-30 cursor-not-allowed";
    }

    return "border-unlocked-border/25 hover:border-unlocked-border/50 active:scale-[0.96]";
  })();

  const labelClass = (() => {
    if (isSuccess) {
      return "text-success";
    }

    if (isExhausted) {
      return "text-muted/30";
    }

    return "text-accent/80";
  })();

  const cornerBorder = isSuccess ? "border-solved-border/50" : "border-unlocked-border";

  return (
    <>
      <button
        onClick={handlePlay}
        disabled={isExhausted}
        className={`relative flex flex-1 cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] px-3 py-3.5 transition-all duration-300 select-none ${borderClass}`}
        style={{
          background: isSuccess
            ? "linear-gradient(155deg, #0a1f1a, #080f0c)"
            : "linear-gradient(155deg, #130f26, #0b0917)",
        }}
      >
        {/* radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isSuccess
              ? "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)"
              : "radial-gradient(ellipse at 50% 10%, #3a2a5a18, transparent 60%)",
          }}
        />

        {/* corner decorations */}
        {!isExhausted && <CornerOrnaments color={cornerBorder} />}

        {/* success badge */}
        {isSuccess && (
          <div className="bg-success absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
            ✓
          </div>
        )}

        {/* waveform icon */}
        <WaveformIcon playing={isPlaying} color={accentColor} />

        {/* label */}
        <span className={`relative text-[0.58rem] font-semibold tracking-[0.2em] uppercase ${labelClass}`}>
          {hint.label}
        </span>

        {/* play-count dots */}
        <PlayCountDot total={MAX_PLAYS} remaining={remaining} solved={isSuccess} />
      </button>

      <AudioWarningModal
        isOpen={isShowingWarning}
        onConfirm={() => {
          setIsShowingWarning(false);
          confirmAndPlay();
        }}
      />
      <LastAttemptModal
        isOpen={isShowingLastAttempt}
        onConfirm={() => {
          setIsShowingLastAttempt(false);
          void playAudio();
        }}
      />
    </>
  );
}
