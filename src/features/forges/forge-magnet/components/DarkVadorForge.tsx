import { useState, useRef } from "react";
import { useForgeStore } from "../../store";
import { isAttemptUsedToday } from "../../../cooldown/store";
import { useMagnetStore } from "../store";
import { ENTITY_ID, CHECK_DURATION_MS } from "../config";
import { getEntityState } from "../../../../ha";
import { sndAnalysis, sndScrambleSolved } from "../../../../audio";
import { EnigmaPicker } from "../../../enigma/components/EnigmaPicker";
import { PlayCountDot } from "../../../../components/PlayCountDot";
import { AudioWarningModal } from "../../../../components/AudioWarningModal";
import { LastAttemptModal } from "../../../../components/LastAttemptModal";
import { CooldownLabel } from "../../../cooldown/components/CooldownLabel";
import { WideWaveform } from "./WideWaveform";
import type { ForgeProps } from "../../types";
import darkVadorSrc from "../../../../assets/audios/pascale-dark_vador-enigme.mp3";

/**
 * Forge : La chaleur de l'Arc-en-ciel
 * Joue l'audio Dark Vador, puis détecte le signal Home Assistant de l'aimant.
 */
export function DarkVadorForge({ solved, onSolve }: ForgeProps) {
  const darkVadorPlayedAt = useMagnetStore((s) => s.darkVadorPlayedAt);
  const recordDarkVadorPlay = useMagnetStore((s) => s.recordDarkVadorPlay);
  const audioWarningAcknowledged = useForgeStore((s) => s.audioWarningAcknowledged);
  const playedToday = isAttemptUsedToday(darkVadorPlayedAt);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showLastAttempt, setShowLastAttempt] = useState(false);
  const shakeRef = useRef<HTMLButtonElement>(null);

  async function playAudio() {
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

  function handlePlay() {
    if (isPlaying) return;
    if (!audioWarningAcknowledged) {
      setShowWarning(true);
      return;
    }
    setShowLastAttempt(true);
  }

  async function handleCheck() {
    if (isChecking || showPicker) return;
    setHasError(false);
    setIsChecking(true);
    const stopAnalysis = sndAnalysis();

    const half = CHECK_DURATION_MS / 2;
    await new Promise<void>((r) => setTimeout(r, half));

    const state1 = await getEntityState(ENTITY_ID);
    if (state1 === "on") {
      stopAnalysis();
      setIsChecking(false);
      setShowPicker(true);
      sndScrambleSolved();
      return;
    }

    await new Promise<void>((r) => setTimeout(r, half));

    const state3 = await getEntityState(ENTITY_ID);
    setIsChecking(false);

    if (state3 === "on") {
      stopAnalysis();
      setShowPicker(true);
      sndScrambleSolved();
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

  // ── Épreuve terminée (persisté) ──
  if (solved) {
    return (
      <div className="mt-6">
        <div
          className="w-full relative overflow-hidden flex flex-col items-center gap-2 py-4 px-4 rounded-[14px] border-[1.5px] border-solved-border/50 shadow-[0_0_22px_#4ecca325]"
          style={{ background: "linear-gradient(155deg, #0a1f1a, #080f0c)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)" }} />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-solved-border/50" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-solved-border/50" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-solved-border/50" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-solved-border/50" />
          <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full bg-success flex items-center justify-center text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">✓</div>
          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="var(--color-success)" />
          </div>
          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-success">
            Dark Vador a trouvé un nouvel ami
          </span>
        </div>
      </div>
    );
  }

  // ── Mode lecture disponible ──
  if (!playedToday && !isPlaying) {
    return (
      <div className="mt-6">
        <button
          onClick={handlePlay}
          className="w-full relative overflow-hidden flex flex-col items-center gap-2 py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300 select-none cursor-pointer border-accent/30 hover:border-accent/55 active:scale-[0.98]"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 20%, #3a2a5a12, transparent 60%)" }} />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-accent/30 opacity-50" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-accent/30 opacity-50" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-accent/30 opacity-50" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-accent/30 opacity-50" />
          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="#7a55cc" />
          </div>
          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-accent/80">
            Écouter le secret
          </span>
          <PlayCountDot total={1} remaining={1} />
        </button>
        {showWarning && <AudioWarningModal onConfirm={() => { setShowWarning(false); setShowLastAttempt(true); }} />}
        {showLastAttempt && <LastAttemptModal onConfirm={() => { setShowLastAttempt(false); playAudio(); }} />}
      </div>
    );
  }

  // ── Lecture en cours ──
  if (isPlaying) {
    return (
      <div className="mt-6">
        <button
          disabled
          className="w-full relative overflow-hidden flex flex-col items-center gap-2 py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300 select-none cursor-not-allowed border-accent/60 shadow-[0_0_28px_#9b6dff35]"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #9b6dff22, transparent 65%)" }} />
          <div className="absolute top-[6px] left-[6px] w-2 h-2 border-t border-l border-accent/50 opacity-60" />
          <div className="absolute top-[6px] right-[6px] w-2 h-2 border-t border-r border-accent/50 opacity-60" />
          <div className="absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l border-accent/50 opacity-60" />
          <div className="absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r border-accent/50 opacity-60" />
          <div className="relative w-full px-1">
            <WideWaveform playing={true} color="var(--color-accent)" />
          </div>
          <span className="relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase text-accent">
            Lecture en cours…
          </span>
        </button>
      </div>
    );
  }

  // ── Mode vérification HA (joué aujourd'hui) ──
  const borderClass = hasError
    ? "border-danger/60 shadow-[0_0_20px_#ff6b8a25]"
    : showPicker
      ? "border-solved-border/55 shadow-[0_0_22px_#4ecca328]"
      : isChecking
        ? "border-gold/50 shadow-[0_0_18px_#e8c96a20]"
        : "border-accent/35 hover:border-accent/60 shadow-[0_0_18px_#9b6dff20] hover:shadow-[0_0_28px_#9b6dff35] active:scale-[0.98]";

  const barColor = hasError ? "var(--color-danger)" : showPicker ? "var(--color-success)" : isChecking ? "var(--color-gold)" : "var(--color-accent)";
  const bgStyle = hasError
    ? "radial-gradient(ellipse at 50% 50%, #ff6b8a18, transparent 65%)"
    : showPicker
      ? "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)"
      : isChecking
        ? "radial-gradient(ellipse at 50% 50%, #e8c96a12, transparent 65%)"
        : "radial-gradient(ellipse at 50% 50%, #9b6dff12, transparent 60%)";
  const cornerColor = showPicker ? "border-solved-border/50" : isChecking ? "border-gold/25" : "border-accent/25";

  return (
    <div className="mt-6">
      <button
        ref={shakeRef}
        onClick={handleCheck}
        disabled={isChecking || showPicker}
        className={`w-full relative overflow-hidden flex flex-col items-center gap-2 py-4 px-4 rounded-[14px] border-[1.5px] transition-all duration-300 select-none cursor-pointer ${borderClass}`}
        style={{
          background: showPicker
            ? "linear-gradient(155deg, #0a1f1a, #080f0c)"
            : isChecking
              ? "linear-gradient(155deg, #16110a, #0b0a07)"
              : "linear-gradient(155deg, #130f26, #0b0917)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: bgStyle }} />
        {showPicker && (
          <div className="absolute top-2.5 right-3 w-4 h-4 rounded-full bg-success flex items-center justify-center text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">✓</div>
        )}
        <div className={`absolute top-[6px] left-[6px] w-2 h-2 border-t border-l opacity-50 ${cornerColor}`} />
        <div className={`absolute top-[6px] right-[6px] w-2 h-2 border-t border-r opacity-50 ${cornerColor}`} />
        <div className={`absolute bottom-[6px] left-[6px] w-2 h-2 border-b border-l opacity-50 ${cornerColor}`} />
        <div className={`absolute bottom-[6px] right-[6px] w-2 h-2 border-b border-r opacity-50 ${cornerColor}`} />
        {(isChecking || showPicker || hasError) && (
          <div className={`relative w-full px-1 ${isChecking || showPicker ? "" : "opacity-35"}`}>
            <WideWaveform playing={isChecking} color={barColor} />
          </div>
        )}
        <div className="relative flex items-center gap-2">
          {isChecking && (
            <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-gold/30 animate-spin" style={{ borderTopColor: "var(--color-gold)" }} />
          )}
          <span className={`text-[0.58rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-300 ${hasError ? "text-danger" : showPicker ? "text-success" : isChecking ? "text-gold/90" : "text-accent/80"}`}>
            {isChecking ? "Les forces convergent…" : hasError ? "Rien ne s'est produit" : showPicker ? "Une nouvelle amitié s'est formée !" : "Tenter un rapprochement"}
          </span>
        </div>
        {!isChecking && !showPicker && (
          <CooldownLabel
            lastTriggeredAt={darkVadorPlayedAt}
            prefix="Répéter l'énigme dans"
            className="relative text-[0.5rem] tracking-[0.15em] text-accent/25 font-mono"
          />
        )}
      </button>

      {showPicker && (
        <EnigmaPicker onClose={() => { setShowPicker(false); onSolve(); }} />
      )}
    </div>
  );
}
