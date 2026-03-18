import { useState, useEffect, useRef } from "react";
import { useStore, isAttemptUsedToday, msUntilMidnight } from "../store";
import { getEntityState } from "../ha";
import { sndAnalysis } from "../audio";
import { EnigmaPicker } from "./EnigmaPicker";
import darkVadorSrc from "../assets/audios/pascale-dark_vador-enigme.mp3";

const ENTITY_ID = "input_boolean.gift_grimoire_aimant";
const CHECK_DURATION_MS = 5000;

const BAR_COUNT = 32;
const BAR_HEIGHTS: number[] = Array.from({ length: BAR_COUNT }, (_, i) => {
  const envelope = Math.sin((i / (BAR_COUNT - 1)) * Math.PI) * 0.55 + 0.3;
  const jitter = ((i * 17 + 3) % 11) / 11 * 0.25 - 0.1;
  return Math.max(0.12, Math.min(1, envelope + jitter));
});

function WideWaveform({ playing, color }: { playing: boolean; color: string }) {
  const VB_W = BAR_COUNT * 9;
  const VB_H = 36;
  return (
    <svg
      width="100%"
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {BAR_HEIGHTS.map((h, i) => {
        const barH = Math.max(3, h * VB_H);
        const y = (VB_H - barH) / 2;
        return (
          <rect
            key={i}
            x={i * 9 + 1.5}
            y={y}
            width={5}
            height={barH}
            rx={2}
            fill={color}
            style={{
              transformOrigin: `${i * 9 + 4}px ${VB_H / 2}px`,
              opacity: playing ? undefined : 0.4,
              ...(playing && {
                animation: "sound-bar 0.8s ease-in-out infinite",
                animationDelay: `${(i % 10) * 70}ms`,
              }),
            }}
          />
        );
      })}
    </svg>
  );
}

function useCountdown() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    function tick() {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setLabel(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function DarkVadorButton() {
  const darkVadorPlayedAt = useStore((s) => s.darkVadorPlayedAt);
  const recordDarkVadorPlay = useStore((s) => s.recordDarkVadorPlay);
  const magnetSolved = useStore((s) => s.magnetSolved);
  const solveMagnet = useStore((s) => s.solveMagnet);
  const playedToday = isAttemptUsedToday(darkVadorPlayedAt);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const shakeRef = useRef<HTMLButtonElement>(null);
  const countdown = useCountdown();

  async function handlePlay() {
    if (isPlaying) return;
    const audio = new Audio(darkVadorSrc);
    setIsPlaying(true);
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      recordDarkVadorPlay();
    });
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }

  async function handleCheck() {
    if (isChecking || showPicker) return;
    setHasError(false);
    setIsChecking(true);
    sndAnalysis();

    const [state] = await Promise.all([
      getEntityState(ENTITY_ID),
      new Promise<void>((resolve) => setTimeout(resolve, CHECK_DURATION_MS)),
    ]);

    setIsChecking(false);
    if (state === "on") {
      setShowPicker(true);
    } else {
      setHasError(true);
      const el = shakeRef.current;
      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "shake 0.5s ease";
      }
      setTimeout(() => setHasError(false), 3000);
    }
  }

  // ── Énigme terminée (persisté) ──
  if (magnetSolved) {
    return (
      <div className="mt-6">
        <div
          className="w-full relative overflow-hidden flex flex-col items-center gap-2
            py-4 px-4 rounded-[14px] border-[1.5px]
            border-solved-border/50 shadow-[0_0_22px_#4ecca325]"
          style={{
            background: "linear-gradient(155deg, #0a1f1a, #080f0c)",
            animation: "solved-glow 3s ease-in-out infinite",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)",
            }}
          />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-solved-border/50" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-solved-border/50" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-solved-border/50" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-solved-border/50" />

          {/* badge succès */}
          <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full bg-success flex items-center justify-center text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
            ✓
          </div>

          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="#4ecca3" />
          </div>

          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-success">
            Énigme de l'aimant résolue
          </span>
          <span className="relative text-[0.5rem] tracking-[0.12em] text-success/50">
            Le signal magnétique a été détecté
          </span>
        </div>
      </div>
    );
  }

  // ── Play mode ──
  if (!playedToday && !isPlaying) {
    return (
      <div className="mt-6">
        <button
          onClick={handlePlay}
          className="w-full relative overflow-hidden flex flex-col items-center gap-2
            py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300
            select-none cursor-pointer
            border-accent/30 hover:border-accent/55 active:scale-[0.98]"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 20%, #3a2a5a12, transparent 60%)",
            }}
          />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-accent/30 opacity-50" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-accent/30 opacity-50" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-accent/30 opacity-50" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-accent/30 opacity-50" />

          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="#7a55cc" />
          </div>
          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-accent/50">
            Écouter l'énigme cachée
          </span>
        </button>
      </div>
    );
  }

  // ── Playing mode ──
  if (isPlaying) {
    return (
      <div className="mt-6">
        <button
          disabled
          className="w-full relative overflow-hidden flex flex-col items-center gap-2
            py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300
            select-none cursor-not-allowed
            border-accent/60 shadow-[0_0_28px_#9b6dff35]"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 50%, #9b6dff22, transparent 65%)",
            }}
          />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-accent/50 opacity-60" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-accent/50 opacity-60" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-accent/50 opacity-60" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-accent/50 opacity-60" />

          <div className="relative w-full px-1">
            <WideWaveform playing={true} color="#9b6dff" />
          </div>
          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-accent">
            Lecture en cours…
          </span>
        </button>
      </div>
    );
  }

  // ── HA check mode (joué aujourd'hui) ──
  const borderClass = hasError
    ? "border-danger/60 shadow-[0_0_20px_#ff6b8a25]"
    : showPicker
      ? "border-solved-border/55 shadow-[0_0_22px_#4ecca328]"
      : isChecking
        ? "border-gold/50 shadow-[0_0_18px_#e8c96a20]"
        : "border-gold/25 hover:border-gold/45 active:scale-[0.98]";

  const barColor = hasError ? "#ff6b8a" : showPicker ? "#4ecca3" : "#e8c96a";
  const bgStyle = hasError
    ? "radial-gradient(ellipse at 50% 50%, #ff6b8a18, transparent 65%)"
    : showPicker
      ? "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)"
      : isChecking
        ? "radial-gradient(ellipse at 50% 50%, #e8c96a12, transparent 65%)"
        : "radial-gradient(ellipse at 50% 20%, #e8c96a08, transparent 60%)";
  const cornerColor = showPicker ? "border-solved-border/50" : "border-gold/25";

  return (
    <div className="mt-6">
      <button
        ref={shakeRef}
        onClick={handleCheck}
        disabled={isChecking || showPicker}
        className={`
          w-full relative overflow-hidden flex flex-col items-center gap-2
          py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300
          select-none cursor-pointer
          ${borderClass}
        `}
        style={{
          background: showPicker
            ? "linear-gradient(155deg, #0a1f1a, #080f0c)"
            : "linear-gradient(155deg, #16110a, #0b0a07)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: bgStyle }} />

        {/* badge succès quand signal détecté */}
        {showPicker && (
          <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full bg-success flex items-center justify-center text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
            ✓
          </div>
        )}

        <div className={`absolute top-[6px] left-[6px] w-2 h-2 border-t border-l opacity-50 ${cornerColor}`} />
        <div className={`absolute top-[6px] right-[6px] w-2 h-2 border-t border-r opacity-50 ${cornerColor}`} />
        <div className={`absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l opacity-50 ${cornerColor}`} />
        <div className={`absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r opacity-50 ${cornerColor}`} />

        <div className={`relative w-full px-1 ${isChecking || showPicker ? "" : "opacity-35"}`}>
          <WideWaveform playing={isChecking} color={barColor} />
        </div>

        <div className="relative flex items-center gap-2">
          {isChecking && (
            <span
              className="w-2.5 h-2.5 rounded-full border-[1.5px] border-gold/30 animate-spin"
              style={{ borderTopColor: "#e8c96a" }}
            />
          )}
          <span
            className={`text-[0.58rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-300 ${
              hasError
                ? "text-danger"
                : showPicker
                  ? "text-success"
                  : isChecking
                    ? "text-gold/90"
                    : "text-gold/40"
            }`}
          >
            {isChecking
              ? "Analyse du signal…"
              : hasError
                ? "Signal absent — réessayez"
                : showPicker
                  ? "Signal magnétique détecté"
                  : "Vérifier le signal magnétique"}
          </span>
        </div>

        {showPicker && (
          <span className="relative text-[0.5rem] tracking-[0.12em] text-success/50">
            Choisissez l'énigme à déverrouiller ci-dessous
          </span>
        )}

        {!isChecking && !showPicker && countdown && (
          <span className="relative text-[0.5rem] tracking-[0.15em] text-gold/25 font-mono">
            réinitialisation dans {countdown}
          </span>
        )}
      </button>

      {showPicker && (
        <EnigmaPicker
          onClose={() => {
            setShowPicker(false);
            solveMagnet();
          }}
        />
      )}
    </div>
  );
}
