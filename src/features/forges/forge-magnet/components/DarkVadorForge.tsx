import { useRef, useState } from "react";
import darkVadorSrc from "@/assets/audios/pascale-dark_vador-enigme.mp3";
import { sndAnalysis, sndScrambleSolved } from "@/audio";
import { getEntityState } from "@/ha";
import { AudioWarningModal } from "@components/AudioWarningModal";
import { LastAttemptModal } from "@components/LastAttemptModal";
import { PlayCountDot } from "@components/PlayCountDot";
import { CornerOrnaments } from "@components/ui/CornerOrnaments";
import { CooldownLabel } from "@features/cooldown/components/CooldownLabel";
import { isAttemptUsedToday } from "@features/cooldown/store";
import { EnigmaPicker } from "@features/enigma/components/EnigmaPicker";
import { CHECK_DURATION_MS, ENTITY_ID } from "@features/forges/forge-magnet/config";
import { useMagnetStore } from "@features/forges/forge-magnet/store";
import { useForgeStore } from "@features/forges/store";
import type { ForgeProps } from "@features/forges/types";
import { WideWaveform } from "./WideWaveform";

/**
 * Forge : La chaleur de l'Arc-en-ciel
 * Joue l'audio Dark Vador, puis détecte le signal Home Assistant de l'aimant.
 */
export function DarkVadorForge({ solved, onSolve }: Readonly<ForgeProps>): React.JSX.Element {
  const darkVadorPlayedAt = useMagnetStore((s) => s.darkVadorPlayedAt);
  const recordDarkVadorPlay = useMagnetStore((s) => s.recordDarkVadorPlay);
  const hasAudioWarningAcknowledged = useForgeStore((s) => s.audioWarningAcknowledged);
  const hasPlayedToday = isAttemptUsedToday(darkVadorPlayedAt);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isShowingPicker, setIsShowingPicker] = useState(false);
  const [isShowingWarning, setIsShowingWarning] = useState(false);
  const [isShowingLastAttempt, setIsShowingLastAttempt] = useState(false);
  const shakeRef = useRef<HTMLButtonElement>(null);

  async function playAudio(): Promise<void> {
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

  function handlePlay(): void {
    if (isPlaying) {
      return;
    }

    if (!hasAudioWarningAcknowledged) {
      setIsShowingWarning(true);

      return;
    }
    setIsShowingLastAttempt(true);
  }

  async function handleCheck(): Promise<void> {
    if (isChecking || isShowingPicker) {
      return;
    }
    setHasError(false);
    setIsChecking(true);
    const stopAnalysis = sndAnalysis();

    const half = CHECK_DURATION_MS / 2;
    await new Promise<void>((r) => setTimeout(r, half));

    const state1 = await getEntityState(ENTITY_ID);

    if (state1 === "on") {
      stopAnalysis();
      setIsChecking(false);
      setIsShowingPicker(true);
      sndScrambleSolved();

      return;
    }

    await new Promise<void>((r) => setTimeout(r, half));

    const state3 = await getEntityState(ENTITY_ID);
    setIsChecking(false);

    if (state3 === "on") {
      stopAnalysis();
      setIsShowingPicker(true);
      sndScrambleSolved();
    } else {
      setHasError(true);
      const el = shakeRef.current;

      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "shake 0.5s ease";
      }

      setTimeout(() => {
        setHasError(false);
      }, 3000);
    }
  }

  // ── Épreuve terminée (persisté) ──
  if (solved) {
    return (
      <div className="mt-6">
        <div
          className="border-solved-border/50 relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] px-4 py-4 shadow-[0_0_22px_#4ecca325]"
          style={{ background: "linear-gradient(155deg, #0a1f1a, #080f0c)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)" }}
          />
          <CornerOrnaments color="border-solved-border/50" opacity="" />
          <div className="bg-success absolute top-2.5 right-3 flex h-4 w-4 items-center justify-center rounded-full text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
            ✓
          </div>
          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="var(--color-success)" />
          </div>
          <span className="text-success relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase">
            Dark Vador a trouvé un nouvel ami
          </span>
        </div>
      </div>
    );
  }

  // ── Mode lecture disponible ──
  if (!hasPlayedToday && !isPlaying) {
    return (
      <div className="mt-6">
        <button
          onClick={handlePlay}
          className="border-accent/30 hover:border-accent/55 relative flex w-full cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] px-4 py-4 transition-all duration-300 select-none active:scale-[0.98]"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 20%, #3a2a5a12, transparent 60%)" }}
          />
          <CornerOrnaments color="border-accent/30" opacity="opacity-50" />
          <div className="relative w-full px-1">
            <WideWaveform playing={false} color="#7a55cc" />
          </div>
          <span className="text-accent/80 relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase">
            Écouter le secret
          </span>
          <PlayCountDot total={1} remaining={1} />
        </button>
        <AudioWarningModal
          isOpen={isShowingWarning}
          onConfirm={() => {
            setIsShowingWarning(false);
            setIsShowingLastAttempt(true);
          }}
        />
        <LastAttemptModal
          isOpen={isShowingLastAttempt}
          onConfirm={() => {
            setIsShowingLastAttempt(false);
            void playAudio();
          }}
        />
      </div>
    );
  }

  // ── Lecture en cours ──
  if (isPlaying) {
    return (
      <div className="mt-6">
        <button
          disabled
          className="border-accent/60 relative flex w-full cursor-not-allowed flex-col items-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] px-4 py-4 shadow-[0_0_28px_#9b6dff35] transition-all duration-300 select-none"
          style={{ background: "linear-gradient(155deg, #130f26, #0b0917)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 50%, #9b6dff22, transparent 65%)" }}
          />
          <CornerOrnaments color="border-accent/50" opacity="opacity-60" />
          <div className="relative w-full px-1">
            <WideWaveform playing={true} color="var(--color-accent)" />
          </div>
          <span className="text-accent relative text-[0.58rem] font-semibold tracking-[0.22em] uppercase">
            Lecture en cours…
          </span>
        </button>
      </div>
    );
  }

  // ── Mode vérification HA (joué aujourd'hui) ──
  const borderClass = (() => {
    if (hasError) {
      return "border-danger/60 shadow-[0_0_20px_#ff6b8a25]";
    }

    if (isShowingPicker) {
      return "border-solved-border/55 shadow-[0_0_22px_#4ecca328]";
    }

    if (isChecking) {
      return "border-gold/50 shadow-[0_0_18px_#e8c96a20]";
    }

    return "border-accent/35 hover:border-accent/60 shadow-[0_0_18px_#9b6dff20] hover:shadow-[0_0_28px_#9b6dff35] active:scale-[0.98]";
  })();

  const barColor = (() => {
    if (hasError) {
      return "var(--color-danger)";
    }

    if (isShowingPicker) {
      return "var(--color-success)";
    }

    if (isChecking) {
      return "var(--color-gold)";
    }

    return "var(--color-accent)";
  })();

  const bgStyle = (() => {
    if (hasError) {
      return "radial-gradient(ellipse at 50% 50%, #ff6b8a18, transparent 65%)";
    }

    if (isShowingPicker) {
      return "radial-gradient(ellipse at 50% 50%, #4ecca318, transparent 65%)";
    }

    if (isChecking) {
      return "radial-gradient(ellipse at 50% 50%, #e8c96a12, transparent 65%)";
    }

    return "radial-gradient(ellipse at 50% 50%, #9b6dff12, transparent 60%)";
  })();

  const cornerColor = (() => {
    if (isShowingPicker) {
      return "border-solved-border/50";
    }

    if (isChecking) {
      return "border-gold/25";
    }

    return "border-accent/25";
  })();

  return (
    <div className="mt-6">
      <button
        ref={shakeRef}
        onClick={() => {
          void handleCheck();
        }}
        disabled={isChecking || isShowingPicker}
        className={`relative flex w-full cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] px-4 py-4 transition-all duration-300 select-none ${borderClass}`}
        style={{
          background: (() => {
            if (isShowingPicker) {
              return "linear-gradient(155deg, #0a1f1a, #080f0c)";
            }

            if (isChecking) {
              return "linear-gradient(155deg, #16110a, #0b0a07)";
            }

            return "linear-gradient(155deg, #130f26, #0b0917)";
          })(),
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: bgStyle }} />
        {isShowingPicker && (
          <div className="bg-success absolute top-2.5 right-3 flex h-4 w-4 items-center justify-center rounded-full text-[0.5rem] shadow-[0_0_8px_var(--color-success)]">
            ✓
          </div>
        )}
        <CornerOrnaments color={cornerColor} opacity="opacity-50" />
        {(isChecking || isShowingPicker || hasError) && (
          <div className={`relative w-full px-1 ${isChecking || isShowingPicker ? "" : "opacity-35"}`}>
            <WideWaveform playing={isChecking} color={barColor} />
          </div>
        )}
        <div className="relative flex items-center gap-2">
          {isChecking && (
            <span
              className="border-gold/30 h-2.5 w-2.5 animate-spin rounded-full border-[1.5px]"
              style={{ borderTopColor: "var(--color-gold)" }}
            />
          )}
          <span
            className={`text-[0.58rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-300 ${(() => {
              if (hasError) {
                return "text-danger";
              }

              if (isShowingPicker) {
                return "text-success";
              }

              if (isChecking) {
                return "text-gold/90";
              }

              return "text-accent/80";
            })()}`}
          >
            {(() => {
              if (isChecking) {
                return "Les forces convergent…";
              }

              if (hasError) {
                return "Rien ne s'est produit";
              }

              if (isShowingPicker) {
                return "Une nouvelle amitié s'est formée !";
              }

              return "Tenter un rapprochement";
            })()}
          </span>
        </div>
        {!isChecking && !isShowingPicker && (
          <CooldownLabel
            lastTriggeredAt={darkVadorPlayedAt}
            prefix="Répéter l'énigme dans"
            className="text-accent/25 relative font-mono text-[0.5rem] tracking-[0.15em]"
          />
        )}
      </button>

      {isShowingPicker && (
        <EnigmaPicker
          onClose={() => {
            setIsShowingPicker(false);
            onSolve();
          }}
        />
      )}
    </div>
  );
}
