import { useState } from "react";
import { useStore } from "../../store";
import { WaveformIcon } from "./WaveformIcon";
import { MAX_PLAYS, type VoiceHint } from "./constants";
import { PlayCountDot } from "../PlayCountDot";

export function VoiceButton({ hint }: { hint: VoiceHint }) {
  const count = useStore((s) => s.audioPlayCounts[hint.key] ?? 0);
  const incrementAudioPlay = useStore((s) => s.incrementAudioPlay);
  const anyUnlocked = useStore((s) =>
    Object.values(s.enigmas).some((e) => e.unlocked || e.solved),
  );

  const remaining = MAX_PLAYS - count;
  const success = anyUnlocked;
  const exhausted = remaining <= 0;
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePlay() {
    if (exhausted || isPlaying) return;
    const audio = new Audio(hint.src);
    setIsPlaying(true);
    audio.addEventListener("ended", () => setIsPlaying(false));
    try {
      await audio.play();
      incrementAudioPlay(hint.key);
    } catch {
      setIsPlaying(false);
    }
  }

  // ── visual states ──
  const accentColor = success ? "var(--color-success)" : "var(--color-accent)";

  const borderClass = success
    ? "border-solved-border/40 shadow-[0_0_18px_#4ecca320]"
    : isPlaying
      ? "border-accent/50 shadow-[0_0_20px_#9b6dff25]"
      : exhausted
        ? "border-white/5 opacity-30 cursor-not-allowed"
        : "border-unlocked-border/25 hover:border-unlocked-border/50 active:scale-[0.96]";

  const labelClass = success
    ? "text-success/70"
    : exhausted
      ? "text-muted/30"
      : "text-accent/80";

  const cornerBorder = success
    ? "border-solved-border"
    : "border-unlocked-border";

  return (
    <button
      onClick={handlePlay}
      disabled={exhausted}
      className={`flex-1 relative overflow-hidden flex flex-col items-center gap-2 py-3.5 px-3 rounded-[14px] border-[1.5px] transition-all duration-300 select-none cursor-pointer ${borderClass}`}
      style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
    >
      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: success
            ? "radial-gradient(ellipse at 50% 10%, #4ecca315, transparent 60%)"
            : "radial-gradient(ellipse at 50% 10%, #3a2a5a18, transparent 60%)",
        }}
      />

      {/* corner decorations */}
      {!exhausted && (
        <>
          <div className={`absolute top-[6px] left-[6px] w-2 h-2 border-t border-l opacity-35 ${cornerBorder}`} />
          <div className={`absolute top-[6px] right-[6px] w-2 h-2 border-t border-r opacity-35 ${cornerBorder}`} />
          <div className={`absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l opacity-35 ${cornerBorder}`} />
          <div className={`absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r opacity-35 ${cornerBorder}`} />
        </>
      )}

      {/* success badge */}
      {success && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-success flex items-center justify-center text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
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
      <PlayCountDot total={MAX_PLAYS} remaining={remaining} solved={success} />
    </button>
  );
}
