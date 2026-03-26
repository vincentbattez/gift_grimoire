import { useState, useRef } from "react";
import { useStore } from "../store";
import { sndForgeReveal } from "../audio";
import { spawnParticles } from "../particles";
import { LockIcon } from "./LockIcon";
import type { ForgeModule } from "../types/forge";

type ForgePhase = "locked" | "shaking" | "shattering" | "revealing" | "done";

const RUNE_GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];

const RUNE_DATA = RUNE_GLYPHS.map((_, i) => ({
  angle: (Math.PI * 2 / RUNE_GLYPHS.length) * i,
  dist: 60 + Math.random() * 40,
  rot: Math.random() * 360,
}));

interface ForgeSectionProps {
  forge: ForgeModule;
  isAdmin?: boolean;
}

export function ForgeSection({ forge, isAdmin }: ForgeSectionProps) {
  const { key, title, successMessage, component: ForgeComponent } = forge;

  const revealed = useStore((s) => s.forgeRevealed[key]);
  const revealForge = useStore((s) => s.revealForge);
  const solved = useStore((s) => s.forges[key] ?? false);
  const solveForge = useStore((s) => s.solveForge);
  const resetForge = useStore((s) => s.resetForge);

  const [phase, setPhase] = useState<ForgePhase>("locked");
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  if (revealed && phase !== "revealing") {
    return (
      <div
        data-forge-section={key}
        className="rounded-[18px] border overflow-hidden py-8 px-4 transition-colors duration-700"
        style={{
          borderColor: solved ? "var(--color-solved-border)" : "var(--color-locked-border)",
          background: solved ? "linear-gradient(155deg, #0d1a1a, #0b0917)" : "linear-gradient(155deg, #130f26, #0b0917)",
          boxShadow: solved ? "0 0 20px #4ecca320, inset 0 0 30px #4ecca308" : undefined,
        }}
      >
        <div className={`text-center text-[0.5rem] tracking-[0.25em] mb-2 uppercase transition-colors duration-700 ${solved ? "text-success/60" : "text-muted/50"}`}>
          {title}
        </div>
        <ForgeComponent solved={solved} onSolve={() => solveForge(key)} />
        {solved && (
          <div className="mt-6 pt-4 border-t border-success/15 text-center animate-[forge-unblur_0.8s_ease-out_both]">
            <div className="text-[0.5rem] text-success/40 tracking-[0.2em] uppercase mb-1.5">
              ✦ Épreuve accomplie ✦
            </div>
            <p className="text-[0.6rem] text-success/55 leading-relaxed italic max-w-[260px] mx-auto">
              {successMessage}
            </p>
            {isAdmin && (
              <button
                onClick={() => resetForge(key)}
                className="mt-3 px-3 py-1 rounded-md text-[0.55rem] tracking-[0.15em] uppercase border border-danger/30 text-danger/50 bg-danger/5 hover:border-danger/60 hover:text-danger/80 hover:bg-danger/10 transition-all duration-150 active:scale-95"
              >
                ↺ Re-lock
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  function handleUnlock() {
    if (phase !== "locked") return;
    setPhase("shaking");
    navigator.vibrate?.([30, 20, 30, 20, 50, 30, 80]);

    setTimeout(() => {
      setPhase("shattering");
      sndForgeReveal();
      navigator.vibrate?.(200);

      if (lockRef.current) {
        const r = lockRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        spawnParticles(cx, cy, 35, "#9b6dff");
        setTimeout(() => spawnParticles(cx, cy, 20, "#e8c96a"), 150);
      }

      setTimeout(() => {
        setPhase("revealing");
        revealForge(key);
        if (containerRef.current) {
          const r = containerRef.current.getBoundingClientRect();
          spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 15, "#4ecca3");
        }
      }, 500);

      setTimeout(() => setPhase("done"), 1400);
    }, 500);
  }

  return (
    <div
      ref={containerRef}
      data-forge-section={key}
      className="relative rounded-[18px] border border-locked-border overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        ...((phase === "shattering" || phase === "revealing") && {
          animation: "forge-border-glow 1.2s ease-out forwards",
        }),
      }}
    >
      {/* Contenu flouté avant révélation */}
      <div
        className="pointer-events-none select-none py-8 px-4"
        style={{
          filter: phase === "revealing" ? undefined : "blur(6px)",
          opacity: phase === "revealing" ? undefined : 0.3,
          ...(phase === "revealing" && { animation: "forge-unblur 0.8s ease-out forwards" }),
        }}
      >
        <div className="text-center text-[0.5rem] tracking-[0.25em] text-muted/50 mb-2 uppercase">{title}</div>
        <ForgeComponent solved={solved} onSolve={() => solveForge(key)} />
      </div>

      {/* Anneau de pulse au shattering */}
      {phase === "shattering" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, #9b6dff80, #9b6dff20, transparent 70%)", animation: "forge-pulse-ring 0.7s ease-out forwards" }}
        />
      )}
      {phase === "shattering" && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, #9b6dff40, #e8c96a15, transparent 70%)", animation: "forge-flash 0.6s ease-out forwards" }} />
      )}
      {phase === "shattering" && (
        <div className="absolute inset-0 pointer-events-none">
          {RUNE_GLYPHS.map((rune, i) => {
            const { angle, dist, rot } = RUNE_DATA[i];
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 text-[0.7rem] text-accent/70"
                style={{
                  "--rune-tx": `${Math.cos(angle) * dist}px`,
                  "--rune-ty": `${Math.sin(angle) * dist}px`,
                  "--rune-rot": `${rot}deg`,
                  animation: "forge-rune-scatter 0.7s ease-out forwards",
                  animationDelay: `${i * 0.04}s`,
                } as React.CSSProperties}
              >
                {rune}
              </span>
            );
          })}
        </div>
      )}

      {/* Overlay cadenas */}
      {phase !== "revealing" && phase !== "done" && (
        <div
          ref={lockRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={handleUnlock}
          style={{
            ...(phase === "shaking" && { animation: "forge-lock-shake 0.5s ease-in-out" }),
            ...(phase === "shattering" && { animation: "forge-lock-shatter 0.5s ease-in forwards" }),
          }}
        >
          <LockIcon />
          <span className="text-[0.55rem] tracking-[0.25em] text-muted uppercase">{title}</span>
        </div>
      )}
    </div>
  );
}
