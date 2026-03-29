import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sndClick, sndForgeReveal } from "@/audio";
import { spawnParticles } from "@/particles";
import { randomVisual } from "@/utils/random";
import { LockIcon } from "@components/LockIcon";
import { Button } from "@components/ui/Button";
import type { ForgeModule } from "@features/forges/types";

function staggerStyle(
  active: boolean,
  delay: string,
  options?: { translateY?: string; transition?: string },
): CSSProperties {
  const ty = options?.translateY ?? "8px";

  return {
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0)" : `translateY(${ty})`,
    transition: options?.transition ?? "opacity 0.5s ease-out, transform 0.5s ease-out",
    transitionDelay: delay,
  };
}

type ForgePhase = "locked" | "shaking" | "shattering" | "revealing" | "done";

const RUNE_GLYPH_LIST = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];

const RUNE_DATA_LIST = RUNE_GLYPH_LIST.map((_, i) => ({
  angle: ((Math.PI * 2) / RUNE_GLYPH_LIST.length) * i,
  dist: 60 + randomVisual() * 40,
  rot: randomVisual() * 360,
}));

// ── Forge Intro Modal ─────────────────────────────────────────────────────
function ForgeIntroModal({
  title,
  text,
  onClose,
}: Readonly<{
  title: string;
  text: string;
  onClose: () => void;
}>): React.JSX.Element {
  const { t } = useTranslation("forge");
  const [hasEntered, setHasEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  function handleClose(): void {
    if (isClosing) {
      return;
    }
    sndClick();
    setIsClosing(true);
    setHasEntered(false);
    setTimeout(onClose, 450);
  }

  const isActive = hasEntered && !isClosing;

  const ornamentStyle = staggerStyle(isActive, "0.1s");
  const headingStyle = staggerStyle(isActive, "0.3s", {
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  });
  const separatorStyle: CSSProperties = {
    width: isActive ? "40px" : "0px",
    background: "linear-gradient(to right, transparent, #9b6dff4d, transparent)",
    transition: "width 0.6s ease-out",
    transitionDelay: "0.5s",
  };
  const descStyle = staggerStyle(isActive, "0.65s");
  const btnStyle = staggerStyle(isActive, isActive ? "0.85s" : "0s", {
    translateY: "10px",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  });

  return (
    <div
      className={`fixed inset-0 z-[105] flex items-center justify-center bg-black/80 backdrop-blur-[6px] transition-opacity duration-400 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
      onClick={handleClose}
    >
      <div
        className={`border-accent/25 w-[85%] max-w-[340px] rounded-2xl border px-6 py-8 text-center transition-all duration-500 ${
          isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{
          background: "linear-gradient(155deg, #1c1438, #0b0917)",
          boxShadow: "0 0 40px #9b6dff18, 0 0 80px #9b6dff08",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mb-2 text-[1.4rem] opacity-60" style={{ ...ornamentStyle, opacity: isActive ? 0.6 : 0 }}>
          ✦
        </div>
        <h2
          className="text-accent mb-4 text-[0.95rem] font-[var(--font-cinzel-decorative)] drop-shadow-[0_0_16px_#9b6dff30]"
          style={headingStyle}
        >
          {title}
        </h2>
        <div className="mx-auto mb-4 h-px" style={separatorStyle} />
        <p className="text-text/60 mb-6 text-[0.72rem] leading-relaxed italic" style={descStyle}>
          {text}
        </p>
        <button
          onClick={handleClose}
          className="to-accent cursor-pointer rounded-[14px] border-none bg-gradient-to-br from-[#3a2a6a] px-7 py-2.5 text-[0.75rem] font-[var(--font-cinzel)] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_4px_22px_#9b6dff28] transition-all duration-200 active:scale-[0.97]"
          style={btnStyle}
        >
          {t("section.start")}
        </button>
      </div>
    </div>
  );
}

function getForgeContainerStyle(isSolved: boolean): CSSProperties {
  return {
    borderColor: isSolved ? "var(--color-solved-border)" : "var(--color-locked-border)",
    background: isSolved ? "linear-gradient(155deg, #0d1a1a, #0b0917)" : "linear-gradient(155deg, #130f26, #0b0917)",
    boxShadow: isSolved ? "0 0 20px #4ecca320, inset 0 0 30px #4ecca308" : undefined,
  };
}

// ── ForgeSection ──────────────────────────────────────────────────────────
type ForgeSectionProps = {
  forge: ForgeModule;
  isAdmin?: boolean;
};

export function ForgeSection({ forge, isAdmin }: Readonly<ForgeSectionProps>): React.JSX.Element {
  const { t } = useTranslation("forge");
  const { key, introText, adminActionList, component: ForgeComponent } = forge;

  const isRevealed = forge.useRevealed();
  const isSolved = forge.useSolved();

  const [phase, setPhase] = useState<ForgePhase>("locked");
  const [isShowingIntro, setIsShowingIntro] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  if (isRevealed && phase !== "revealing") {
    return (
      <>
        {isShowingIntro && introText && (
          <ForgeIntroModal
            title={t(`${key}.title`)}
            text={t(`${key}.introText`)}
            onClose={() => {
              setIsShowingIntro(false);
            }}
          />
        )}
        <div
          data-forge-section={key}
          className="overflow-hidden rounded-[18px] border px-4 py-8 transition-colors duration-700"
          style={getForgeContainerStyle(isSolved)}
        >
          <div
            className={`mb-2 text-center text-[0.5rem] tracking-[0.25em] uppercase transition-colors duration-700 ${isSolved ? "text-success/60" : "text-muted/50"}`}
          >
            {t(`${key}.title`)}
          </div>
          <ForgeComponent
            solved={isSolved}
            onSolve={() => {
              forge.solve();
            }}
          />
          {!isSolved && isAdmin && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="admin"
                color="success"
                onClick={() => {
                  forge.reveal();
                  forge.solve();
                }}
              >
                ✦ unlock
              </Button>
              {adminActionList?.map((action) => {
                const c = action.color ?? "sky-400";

                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`rounded-md border px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase border-${c}/30 text-${c}/50 bg-${c}/5 hover:border-${c}/60 hover:text-${c}/80 hover:bg-${c}/10 transition-all duration-150 active:scale-95`}
                  >
                    ↺ {action.label}
                  </button>
                );
              })}
            </div>
          )}
          {isSolved && (
            <div className="border-success/15 mt-6 animate-[forge-unblur_0.8s_ease-out_both] border-t pt-4 text-center">
              <div className="text-success/40 mb-1.5 text-[0.5rem] tracking-[0.2em] uppercase">
                {t("section.accomplished")}
              </div>
              <p className="text-success/55 mx-auto max-w-[260px] text-[0.6rem] leading-relaxed italic">
                {t(`${key}.successMessage`)}
              </p>
              {isAdmin && (
                <Button
                  variant="admin"
                  color="danger"
                  className="mt-3"
                  onClick={() => {
                    forge.reset();
                  }}
                >
                  ↺ Re-lock
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  function handleUnlock(): void {
    if (phase !== "locked") {
      return;
    }
    setPhase("shaking");
    navigator.vibrate([30, 20, 30, 20, 50, 30, 80]);

    setTimeout(() => {
      setPhase("shattering");
      sndForgeReveal();
      navigator.vibrate(200);

      if (lockRef.current) {
        const r = lockRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        spawnParticles(cx, cy, 35, "#9b6dff");

        setTimeout(() => {
          spawnParticles(cx, cy, 20, "#e8c96a");
        }, 150);
      }

      setTimeout(() => {
        setPhase("revealing");
        forge.reveal();

        if (introText) {
          setIsShowingIntro(true);
        }

        if (containerRef.current) {
          const r = containerRef.current.getBoundingClientRect();
          spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 15, "#4ecca3");
        }
      }, 500);

      setTimeout(() => {
        setPhase("done");
      }, 1400);
    }, 500);
  }

  return (
    <div
      ref={containerRef}
      data-forge-section={key}
      className="border-locked-border relative overflow-hidden rounded-[18px] border"
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        ...((phase === "shattering" || phase === "revealing") && {
          animation: "forge-border-glow 1.2s ease-out forwards",
        }),
      }}
    >
      {/* Contenu : placeholder flouté avant révélation, vrai composant après */}
      <div
        className="pointer-events-none px-4 py-8 select-none"
        style={{
          filter: phase === "revealing" ? undefined : "blur(6px)",
          opacity: phase === "revealing" ? undefined : 0.3,
          ...(phase === "revealing" && { animation: "forge-unblur 0.8s ease-out forwards" }),
        }}
      >
        <div className="text-muted/50 mb-2 text-center text-[0.5rem] tracking-[0.25em] uppercase">
          {t(`${key}.title`)}
        </div>
        {phase === "revealing" ? (
          <ForgeComponent
            solved={isSolved}
            onSolve={() => {
              forge.solve();
            }}
          />
        ) : (
          <div className="h-24" />
        )}
      </div>

      {/* Anneau de pulse au shattering */}
      {phase === "shattering" && (
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, #9b6dff80, #9b6dff20, transparent 70%)",
            animation: "forge-pulse-ring 0.7s ease-out forwards",
          }}
        />
      )}
      {phase === "shattering" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, #9b6dff40, #e8c96a15, transparent 70%)",
            animation: "forge-flash 0.6s ease-out forwards",
          }}
        />
      )}
      {phase === "shattering" && (
        <div className="pointer-events-none absolute inset-0">
          {RUNE_GLYPH_LIST.map((rune, i) => {
            const { angle, dist, rot } = RUNE_DATA_LIST[i];

            return (
              <span
                key={i}
                className="text-accent/70 absolute top-1/2 left-1/2 text-[0.7rem]"
                style={
                  {
                    "--rune-tx": `${String(Math.cos(angle) * dist)}px`,
                    "--rune-ty": `${String(Math.sin(angle) * dist)}px`,
                    "--rune-rot": `${String(rot)}deg`,
                    animation: "forge-rune-scatter 0.7s ease-out forwards",
                    animationDelay: `${String(i * 0.04)}s`,
                  } as React.CSSProperties
                }
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
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
          role="button"
          tabIndex={0}
          onClick={handleUnlock}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUnlock();
            }
          }}
          style={{
            ...(phase === "shaking" && { animation: "forge-lock-shake 0.5s ease-in-out" }),
            ...(phase === "shattering" && { animation: "forge-lock-shatter 0.5s ease-in forwards" }),
          }}
        >
          <LockIcon />
          <span className="text-muted text-[0.55rem] tracking-[0.25em] uppercase">{t(`${key}.title`)}</span>
          {isAdmin && (
            <Button
              variant="admin"
              color="success"
              className="z-10 mt-2"
              onClick={(e) => {
                e.stopPropagation();
                forge.reveal();
                forge.solve();
              }}
            >
              ✦ unlock
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
