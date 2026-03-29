import { useEffect, useRef, useState } from "react";
import { sndDeepListen, sndOk } from "@/audio";
import { pollEntityState } from "@/ha";
import { EnigmaPicker } from "@features/enigma/components/EnigmaPicker";
import { ENTITY_ID, LISTEN_DURATION_MS } from "@features/forges/forge-vibration/config";
import type { ForgeProps } from "@features/forges/types";

type Phase = "idle" | "listening" | "detected" | "failed";

function SoundWaveIcon({ color, size = 28 }: Readonly<{ color: string; size?: number }>): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0" fill={color} stroke="none" />
      <path d="M15.5 8.5a5.5 5.5 0 0 1 0 7" />
      <path d="M18 6a9 9 0 0 1 0 12" />
      <path d="M8.5 8.5a5.5 5.5 0 0 0 0 7" />
      <path d="M6 6a9 9 0 0 0 0 12" />
    </svg>
  );
}

/** Forge : Le Murmure Invisible — détecte une vibration via Home Assistant */
export function VibrationForge({ solved, onSolve }: Readonly<ForgeProps>): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [isShowingPicker, setIsShowingPicker] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (phase !== "listening") {
      return () => {
        /* noop cleanup */
      };
    }
    const startList = Date.now();
    const id = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startList) / LISTEN_DURATION_MS));
    }, 50);

    return () => {
      clearInterval(id);
    };
  }, [phase]);

  async function handleClick(): Promise<void> {
    if (phase === "listening" || phase === "detected") {
      return;
    }
    setPhase("listening");
    setProgress(0);
    stopSoundRef.current = sndDeepListen();

    const isDetected = await pollEntityState(ENTITY_ID, "on", LISTEN_DURATION_MS);

    stopSoundRef.current();
    stopSoundRef.current = null;

    if (isDetected) {
      setPhase("detected");
      sndOk();
      navigator.vibrate(200);
      setIsShowingPicker(true);
    } else {
      setPhase("failed");
      const el = btnRef.current;

      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "shake 0.5s ease";
      }

      setTimeout(() => {
        setPhase("idle");
      }, 3000);
    }
  }

  const SIZE = 110;
  const SW = 2.5;
  const circleRadius = (SIZE - SW * 2) / 2;
  const circumference = 2 * Math.PI * circleRadius;

  if (solved) {
    return (
      <div className="flex-color flex items-center gap-3">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg className="absolute inset-0 -rotate-90" width={SIZE} height={SIZE}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={circleRadius}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth={SW}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          </svg>
          <div
            className="border-solved-border/50 absolute inset-[8px] flex items-center justify-center rounded-full border shadow-[0_0_22px_#4ecca325]"
            style={{ background: "radial-gradient(circle at 45% 40%, #0a1f1a, #080f0c)" }}
          >
            <span className="text-success text-lg font-bold">✓</span>
          </div>
        </div>
        <p className="text-success text-[0.6rem] font-semibold tracking-[0.18em] uppercase">Vibration détectée</p>
      </div>
    );
  }

  const ringColor = (() => {
    if (phase === "detected") {
      return "var(--color-success)";
    }

    if (phase === "failed") {
      return "var(--color-danger)";
    }

    return "var(--color-accent)";
  })();

  const iconColor = (() => {
    if (phase === "detected") {
      return "var(--color-success)";
    }

    if (phase === "failed") {
      return "var(--color-danger)";
    }

    if (phase === "listening") {
      return "#c4b5fd";
    }

    return "#7a6a9a";
  })();

  const label = (() => {
    if (phase === "listening") {
      return "Concentration…";
    }

    if (phase === "detected") {
      return "Quelque chose a répondu";
    }

    if (phase === "failed") {
      return "Rien ne s'est éveillé";
    }

    return "Tendre l'oreille";
  })();

  const labelColor = (() => {
    if (phase === "detected") {
      return "text-success";
    }

    if (phase === "failed") {
      return "text-danger";
    }

    if (phase === "listening") {
      return "text-accent/80";
    }

    return "text-muted";
  })();

  return (
    <div className="flex-color flex items-center gap-3">
      <button
        ref={btnRef}
        onClick={() => {
          void handleClick();
        }}
        disabled={phase === "listening" || phase === "detected"}
        className="relative cursor-pointer border-none bg-transparent p-0 select-none"
        style={{ width: SIZE, height: SIZE }}
      >
        {phase === "listening" && (
          <>
            <span
              className="border-accent/25 absolute inset-0 rounded-full border"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <span
              className="border-accent/15 absolute inset-0 rounded-full border"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "0.8s" }}
            />
            <span
              className="border-accent/10 absolute inset-0 rounded-full border"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "1.6s" }}
            />
          </>
        )}
        {phase === "detected" && (
          <span
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: "radial-gradient(circle, #4ecca320 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        <svg className="absolute inset-0 -rotate-90" width={SIZE} height={SIZE}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={circleRadius}
            fill="none"
            stroke="white"
            strokeOpacity={0.04}
            strokeWidth={SW}
          />
          {phase === "listening" && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={circleRadius}
              fill="none"
              stroke={ringColor}
              strokeWidth={SW}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
          )}
          {phase === "detected" && (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={circleRadius}
              fill="none"
              stroke={ringColor}
              strokeWidth={SW}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>

        <div
          className={`absolute inset-[8px] flex items-center justify-center rounded-full transition-all duration-500 ${(() => {
            if (phase === "detected") {
              return "border-solved-border/50 border shadow-[0_0_22px_#4ecca325]";
            }

            if (phase === "failed") {
              return "border-danger/30 border";
            }

            if (phase === "listening") {
              return "border-accent/30 border shadow-[0_0_20px_#9b6dff18]";
            }

            return "hover:border-accent/35 border border-[#2e2248]";
          })()}`}
          style={{
            background: (() => {
              if (phase === "detected") {
                return "radial-gradient(circle at 45% 40%, #0a1f1a, #080f0c)";
              }

              if (phase === "listening") {
                return "radial-gradient(circle at 45% 40%, #1a1235, #0d0a1a)";
              }

              return "radial-gradient(circle at 45% 40%, #13102a, #0b0917)";
            })(),
          }}
        >
          {phase === "detected" ? (
            <span className="text-success text-lg font-bold">✓</span>
          ) : (
            <SoundWaveIcon color={iconColor} size={30} />
          )}
        </div>
      </button>

      <p
        className={`text-[0.6rem] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 ${labelColor}`}
      >
        {label}
      </p>

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
