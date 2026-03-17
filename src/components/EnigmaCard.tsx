import { useRef, useEffect } from "react";
import type { Enigma } from "../config";
import { useStore } from "../store";
import { sndClick, sndVictory } from "../audio";
import { spawnCelebration } from "../particles";
import { CELEBRATION_SCROLL_SETTLE_MS, CELEBRATION_DURATION_MS } from "../timings";
import { triggerUnlockEffect } from "../unlock";

export function EnigmaCard({ enigma, isAdmin }: { enigma: Enigma; isAdmin: boolean }) {
  const state = useStore((s) => s.enigmas[enigma.id]);
  const openModal = useStore((s) => s.openModal);
  const acknowledgeUnlock = useStore((s) => s.acknowledgeUnlock);
  const relock = useStore((s) => s.relock);
  const isCelebrating = useStore((s) => s.celebrateCardId === enigma.id);
  const clearCelebrate = useStore((s) => s.clearCelebrate);
  const isNew = useStore((s) => s.newlyUnlocked.has(enigma.id));
  const ref = useRef<HTMLDivElement>(null);

  const isLocked = !state.unlocked && !state.solved;
  const isSolved = state.solved;

  useEffect(() => {
    if (!isCelebrating || !ref.current) return;

    const card = ref.current;

    // Scroll vers la carte
    card.scrollIntoView({ behavior: "smooth", block: "center" });

    // Attendre le scroll puis lancer la célébration
    let clearTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      // Son de victoire
      sndVictory();

      // Vibration mobile
      navigator.vibrate?.(200);

      // Animation CSS sur la carte
      card.style.animation = "solve-celebrate 1s ease-out";
      card.addEventListener(
        "animationend",
        () => { card.style.animation = ""; },
        { once: true },
      );

      // Particules spectaculaires
      const r = card.getBoundingClientRect();
      spawnCelebration(r.left + r.width / 2, r.top + r.height / 2);

      // Nettoyage après la célébration
      clearTimer = setTimeout(() => clearCelebrate(), CELEBRATION_DURATION_MS);
    }, CELEBRATION_SCROLL_SETTLE_MS);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [isCelebrating, clearCelebrate]);

  function handleClick() {
    if (isLocked) return;
    if (isNew) acknowledgeUnlock(enigma.id);
    sndClick();
    openModal(enigma.id);
  }

  function handleAdminUnlock(e: React.MouseEvent) {
    e.stopPropagation();
    triggerUnlockEffect(enigma.id, enigma.title);
  }

  function handleAdminRelock(e: React.MouseEvent) {
    e.stopPropagation();
    relock(enigma.id);
  }

  const base =
    "aspect-[2/3] rounded-[18px] border-[1.5px] relative overflow-hidden flex flex-col items-center justify-center p-3 px-2 select-none transition-all duration-400";

  const stateClass = isSolved
    ? "border-solved-border shadow-[0_0_22px_#4ecca340,inset_0_0_16px_#4ecca310] cursor-pointer"
    : state.unlocked
      ? "border-unlocked-border cursor-pointer active:scale-[0.94]"
      : "border-locked-border grayscale brightness-[0.35]";

  return (
    <div
      ref={ref}
      className={`${base} ${stateClass}`}
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
        ...(isNew && {
          background: "linear-gradient(155deg, rgb(11 9 23), rgb(42 28 122))",
          animation: "newly-unlocked-pulse 2s ease-in-out infinite",
          borderColor: "var(--color-accent)",
        }),
      }}
      onClick={handleClick}
    >
      {/* Radial glow overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_10%,#3a2a5a18,transparent_65%)]" />

      {/* Corner decorations */}
      {!isLocked && (
        <>
          <div className="absolute top-[7px] left-[7px] w-2.5 h-2.5 border-unlocked-border border-t border-l opacity-45" />
          <div className="absolute top-[7px] right-[7px] w-2.5 h-2.5 border-unlocked-border border-t border-r opacity-45" />
          <div className="absolute bottom-[7px] left-[7px] w-2.5 h-2.5 border-unlocked-border border-b border-l opacity-45" />
          <div className="absolute bottom-[7px] right-[7px] w-2.5 h-2.5 border-unlocked-border border-b border-r opacity-45" />
        </>
      )}

      {/* Solved badge */}
      {isSolved && (
        <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-success flex items-center justify-center text-[0.72rem] shadow-[0_0_12px_var(--color-success)]">
          ✓
        </div>
      )}

      {/* Card content */}
      {isLocked ? (
        <>
          <div className="text-2xl text-muted mb-1.5 opacity-60">🔒</div>
          <div className="text-[0.6rem] tracking-[0.2em] text-muted uppercase">
            Énigme {enigma.id}
          </div>
        </>
      ) : (
        <>
          <div className="text-[0.6rem] tracking-[0.2em] text-muted uppercase mb-2">
            Énigme {enigma.id}
          </div>
          <div className="text-[2.3rem] mb-2 leading-none drop-shadow-[0_0_10px_rgba(155,109,255,0.6)]">
            {enigma.icon}
          </div>
          <div className="text-[0.68rem] text-center text-text tracking-wide leading-[1.45]">
            {enigma.title}
          </div>
        </>
      )}

      {/* Admin buttons */}
      {isAdmin && isLocked && (
        <button
          onClick={handleAdminUnlock}
          className="absolute bottom-2 z-10 px-2 py-0.5 text-[0.55rem] rounded-full bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
        >
          unlock
        </button>
      )}
      {isAdmin && !isLocked && (
        <button
          onClick={handleAdminRelock}
          className="absolute bottom-2 z-10 px-2 py-0.5 text-[0.55rem] rounded-full bg-danger/20 border border-danger/40 text-danger hover:bg-danger/30 transition-colors"
        >
          relock
        </button>
      )}

      {/* Rune */}
      <div className="absolute bottom-2.5 text-[0.65rem] opacity-20 tracking-[0.1em] text-accent">
        {enigma.rune}
      </div>
    </div>
  );
}
