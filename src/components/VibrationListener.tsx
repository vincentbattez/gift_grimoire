import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import { pollEntityState } from "../ha";
import { sndDeepListen, sndOk } from "../audio";
import { EnigmaPicker } from "./EnigmaPicker";

const ENTITY_ID = "binary_sensor.gift_grimoire_vibration_vibration";
const LISTEN_DURATION_MS = 10_000;

type Phase = "idle" | "listening" | "detected" | "failed";

function SoundWaveIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0" fill={color} stroke="none" />
      <path d="M15.5 8.5a5.5 5.5 0 0 1 0 7" />
      <path d="M18 6a9 9 0 0 1 0 12" />
      <path d="M8.5 8.5a5.5 5.5 0 0 0 0 7" />
      <path d="M6 6a9 9 0 0 0 0 12" />
    </svg>
  );
}

export function VibrationListener() {
  const vibrationSolved = useStore((s) => s.vibrationSolved);
  const solveVibration = useStore((s) => s.solveVibration);

  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase !== "listening") return;
    const start = Date.now();
    const id = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - start) / LISTEN_DURATION_MS));
    }, 50);
    return () => clearInterval(id);
  }, [phase]);

  const stopSoundRef = useRef<(() => void) | null>(null);

  async function handleClick() {
    if (phase === "listening" || phase === "detected") return;
    setPhase("listening");
    setProgress(0);
    stopSoundRef.current = sndDeepListen();

    const detected = await pollEntityState(ENTITY_ID, "on", LISTEN_DURATION_MS);

    stopSoundRef.current?.();
    stopSoundRef.current = null;

    if (detected) {
      setPhase("detected");
      sndOk();
      navigator.vibrate?.(200);
      setShowPicker(true);
    } else {
      setPhase("failed");
      const el = btnRef.current;
      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "shake 0.5s ease";
      }
      setTimeout(() => setPhase("idle"), 3000);
    }
  }

  const SIZE = 110;
  const SW = 2.5;
  const R = (SIZE - SW * 2) / 2;
  const C = 2 * Math.PI * R;

  // ── État résolu (persisté) ──
  if (vibrationSolved) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg className="absolute inset-0 -rotate-90" width={SIZE} height={SIZE}>
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke="#4ecca3" strokeWidth={SW}
              strokeDasharray={C} strokeDashoffset={0}
              strokeLinecap="round"
            />
          </svg>
          <div
            className="absolute inset-[8px] rounded-full flex items-center justify-center border border-solved-border/50 shadow-[0_0_22px_#4ecca325]"
            style={{ background: "radial-gradient(circle at 45% 40%, #0a1f1a, #080f0c)" }}
          >
            <span className="text-success text-lg font-bold">✓</span>
          </div>
        </div>
        <p className="text-[0.6rem] tracking-[0.18em] uppercase font-semibold text-success">
          Vibration détectée
        </p>
      </div>
    );
  }

  const ringColor =
    phase === "detected" ? "#4ecca3" :
    phase === "failed" ? "#ff6b8a" :
    "#9b6dff";

  const iconColor =
    phase === "detected" ? "#4ecca3" :
    phase === "failed" ? "#ff6b8a" :
    phase === "listening" ? "#c4b5fd" :
    "#7a6a9a";

  const label =
    phase === "listening" ? "Concentration…" :
    phase === "detected" ? "Quelque chose a répondu" :
    phase === "failed" ? "Rien ne s'est éveillé" :
    "Tendre l'oreille";

  const labelColor =
    phase === "detected" ? "text-success" :
    phase === "failed" ? "text-danger" :
    phase === "listening" ? "text-accent/80" :
    "text-muted";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={phase === "listening" || phase === "detected"}
        className="relative select-none cursor-pointer bg-transparent border-none p-0"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Sonar ripples when listening */}
        {phase === "listening" && (
          <>
            <span
              className="absolute inset-0 rounded-full border border-accent/25"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <span
              className="absolute inset-0 rounded-full border border-accent/15"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "0.8s" }}
            />
            <span
              className="absolute inset-0 rounded-full border border-accent/10"
              style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "1.6s" }}
            />
          </>
        )}

        {/* Detected glow */}
        {phase === "detected" && (
          <span
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: "radial-gradient(circle, #4ecca320 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Progress ring SVG */}
        <svg className="absolute inset-0 -rotate-90" width={SIZE} height={SIZE}>
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="white" strokeOpacity={0.04} strokeWidth={SW}
          />
          {phase === "listening" && (
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={ringColor} strokeWidth={SW}
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
          )}
          {phase === "detected" && (
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={ringColor} strokeWidth={SW}
              strokeDasharray={C} strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>

        {/* Inner disc */}
        <div
          className={`absolute inset-[8px] rounded-full flex items-center justify-center transition-all duration-500 ${
            phase === "detected"
              ? "border border-solved-border/50 shadow-[0_0_22px_#4ecca325]"
              : phase === "failed"
                ? "border border-danger/30"
                : phase === "listening"
                  ? "border border-accent/30 shadow-[0_0_20px_#9b6dff18]"
                  : "border border-[#2e2248] hover:border-accent/35"
          }`}
          style={{
            background:
              phase === "detected"
                ? "radial-gradient(circle at 45% 40%, #0a1f1a, #080f0c)"
                : phase === "listening"
                  ? "radial-gradient(circle at 45% 40%, #1a1235, #0d0a1a)"
                  : "radial-gradient(circle at 45% 40%, #13102a, #0b0917)",
          }}
        >
          {phase === "detected" ? (
            <span className="text-success text-lg font-bold">✓</span>
          ) : (
            <SoundWaveIcon color={iconColor} size={30} />
          )}
        </div>
      </button>

      {/* Label */}
      <p className={`text-[0.6rem] tracking-[0.18em] uppercase font-semibold transition-colors duration-300 ${labelColor}`}>
        {label}
      </p>

      {/* Picker — choix de l'énigme à déverrouiller */}
      {showPicker && (
        <EnigmaPicker
          onClose={() => {
            setShowPicker(false);
            solveVibration();
          }}
        />
      )}
    </div>
  );
}
