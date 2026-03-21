import { useRef, useState } from "react";
import { ENIGMAS } from "../config";
import { useStore } from "../store";
import { sndForgeReveal } from "../audio";
import { spawnParticles } from "../particles";
import { EnigmaCard } from "./EnigmaCard";
import { LetterScramble } from "./LetterScramble";
import { VoiceHints } from "./voice-hints/VoiceHints";
import { DarkVadorButton } from "./DarkVadorButton";
import { VibrationListener } from "./VibrationListener";
import { LockIcon } from "./LockIcon";

type ForgePhase = "locked" | "shaking" | "shattering" | "revealing" | "done";

const RUNE_GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];

const FORGE_SUCCESS_MESSAGES: Record<string, string> = {
  scramble: "Les lettres égarées ont retrouvé leur place… Une nouvelle clé se forge dans la lumière.",
  magnet: "Pascal changea les couleurs sombres du cœur de Dark Vador. Le seigneur des ténèbres posa enfin son sabre et sourit.",
  vibration: "Le murmure s'est tu… mais son secret résonne encore. Une clé naît du silence.",
};

function ForgeSection({ forgeKey, title, children }: { forgeKey: string; title: string; children: React.ReactNode }) {
  const revealed = useStore((s) => s.forgeRevealed[forgeKey]);
  const revealForge = useStore((s) => s.revealForge);
  const solved = useStore((s) =>
    forgeKey === "scramble" ? s.scrambleSolved
    : forgeKey === "magnet" ? s.magnetSolved
    : forgeKey === "vibration" ? s.vibrationSolved
    : false,
  );
  const [phase, setPhase] = useState<ForgePhase>("locked");
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  if (revealed && phase !== "revealing") {
    return (
      <div
        className="rounded-[18px] border overflow-hidden py-8 px-4 transition-colors duration-700"
        style={{
          borderColor: solved ? "var(--color-solved-border)" : "var(--color-locked-border)",
          background: solved
            ? "linear-gradient(155deg, #0d1a1a, #0b0917)"
            : "linear-gradient(155deg, #130f26, #0b0917)",
          boxShadow: solved ? "0 0 20px #4ecca320, inset 0 0 30px #4ecca308" : undefined,
        }}
      >
        <div className={`text-center text-[0.5rem] tracking-[0.25em] mb-2 uppercase transition-colors duration-700 ${solved ? "text-success/60" : "text-muted/50"}`}>
          {title}
        </div>
        {children}
        {solved && (
          <div className="mt-6 pt-4 border-t border-success/15 text-center animate-[forge-unblur_0.8s_ease-out_both]">
            <div className="text-[0.5rem] text-success/40 tracking-[0.2em] uppercase mb-1.5">
              ✦ Épreuve accomplie ✦
            </div>
            <p className="text-[0.6rem] text-success/55 leading-relaxed italic max-w-[260px] mx-auto">
              {FORGE_SUCCESS_MESSAGES[forgeKey]}
            </p>
          </div>
        )}
      </div>
    );
  }

  function handleUnlock() {
    if (phase !== "locked") return;

    // Phase 1: Shake
    setPhase("shaking");
    navigator.vibrate?.([30, 20, 30, 20, 50, 30, 80]);

    // Phase 2: Shatter — after shake completes
    setTimeout(() => {
      setPhase("shattering");
      sndForgeReveal();
      navigator.vibrate?.(200);

      // Spawn particles from lock center
      if (lockRef.current) {
        const r = lockRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        spawnParticles(cx, cy, 35, "#9b6dff");
        setTimeout(() => spawnParticles(cx, cy, 20, "#e8c96a"), 150);
      }

      // Phase 3: Reveal content
      setTimeout(() => {
        setPhase("revealing");
        revealForge(forgeKey);

        // Final particle burst from container center
        if (containerRef.current) {
          const r = containerRef.current.getBoundingClientRect();
          spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 15, "#4ecca3");
        }
      }, 500);

      // Phase 4: Done
      setTimeout(() => setPhase("done"), 1400);
    }, 500);
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-[18px] border border-locked-border overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        ...(phase === "shattering" && {
          animation: "forge-border-glow 1.2s ease-out forwards",
        }),
        ...(phase === "revealing" && {
          animation: "forge-border-glow 1.2s ease-out forwards",
        }),
      }}
    >
      {/* Blurred content — un-blurs during reveal */}
      <div
        className="pointer-events-none select-none py-8 px-4"
        style={{
          filter: phase === "revealing" ? undefined : "blur(6px)",
          opacity: phase === "revealing" ? undefined : 0.3,
          ...(phase === "revealing" && {
            animation: "forge-unblur 0.8s ease-out forwards",
          }),
        }}
      >
        <div className="text-center text-[0.5rem] tracking-[0.25em] text-muted/50 mb-2 uppercase">
          {title}
        </div>
        {children}
      </div>

      {/* Radial pulse ring — fires on shatter */}
      {phase === "shattering" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, #9b6dff80, #9b6dff20, transparent 70%)",
            animation: "forge-pulse-ring 0.7s ease-out forwards",
          }}
        />
      )}

      {/* Screen flash overlay */}
      {phase === "shattering" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, #9b6dff40, #e8c96a15, transparent 70%)",
            animation: "forge-flash 0.6s ease-out forwards",
          }}
        />
      )}

      {/* Scattered rune fragments — fly out on shatter */}
      {phase === "shattering" && (
        <div className="absolute inset-0 pointer-events-none">
          {RUNE_GLYPHS.map((rune, i) => {
            const angle = (Math.PI * 2 / RUNE_GLYPHS.length) * i;
            const dist = 60 + Math.random() * 40;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 text-[0.7rem] text-accent/70"
                style={{
                  "--rune-tx": `${Math.cos(angle) * dist}px`,
                  "--rune-ty": `${Math.sin(angle) * dist}px`,
                  "--rune-rot": `${Math.random() * 360}deg`,
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

      {/* Lock overlay — shakes then shatters */}
      {phase !== "revealing" && phase !== "done" && (
        <div
          ref={lockRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={handleUnlock}
          style={{
            ...(phase === "shaking" && {
              animation: "forge-lock-shake 0.5s ease-in-out",
            }),
            ...(phase === "shattering" && {
              animation: "forge-lock-shatter 0.5s ease-in forwards",
            }),
          }}
        >
          <LockIcon />
          <span className="text-[0.55rem] tracking-[0.25em] text-muted uppercase">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}


export function EnigmaGrid({ isAdmin }: { isAdmin: boolean }) {
  const enigmas = useStore((s) => s.enigmas);
  const prologueCompleted = Object.values(enigmas).some(
    (e) => e.unlocked || e.solved,
  );
  const solvedCount = Object.values(enigmas).filter((e) => e.solved).length;

  return (
    <>
      {/* ── Prologue ── */}
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase">
        — Prologue —
      </div>
      <VoiceHints />

      {/* ── Les Six Mystères ── */}
      <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase mt-12">
        — Les Six Mystères Scellés —
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENIGMAS.map((e) => (
          <div key={e.id} data-card-id={e.id}>
            <EnigmaCard enigma={e} isAdmin={isAdmin} />
          </div>
        ))}
      </div>
      {solvedCount > 0 && (
        <div className="text-center text-[0.55rem] tracking-[0.2em] text-gold/60 mt-3">
          ✨ {solvedCount}/6 mystères percés
        </div>
      )}

      {/* ── La Forge des Clés ── */}
      {prologueCompleted && (
        <>
          <div className="text-center text-[0.6rem] tracking-[0.35em] text-muted my-4 uppercase mt-16">
            — La Forge des Clés —
          </div>
          <p className="text-center text-[0.5rem] text-muted/40 -mt-2 mb-5 tracking-wide">
            Résolvez les épreuves pour forger de nouvelles clés
          </p>

          <div className="flex flex-col gap-10">
            <ForgeSection forgeKey="magnet" title="La chaleur de L'Arc-en-ciel">
              <DarkVadorButton />
            </ForgeSection>
            <ForgeSection forgeKey="scramble" title="Le Maillon des Égarés">
              <LetterScramble />
            </ForgeSection>
            <ForgeSection forgeKey="vibration" title="Le Murmure Invisible">
              <VibrationListener />
            </ForgeSection>
          </div>
        </>
      )}
    </>
  );
}
