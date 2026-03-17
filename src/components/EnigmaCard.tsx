import { useRef } from "react";
import type { Enigma } from "../config";
import { useStore } from "../store";
import { sndClick, sndUnlock } from "../audio";
import { spawnParticles } from "./Starfield";

export function EnigmaCard({ enigma, isAdmin }: { enigma: Enigma; isAdmin: boolean }) {
  const state = useStore((s) => s.enigmas[enigma.id]);
  const openModal = useStore((s) => s.openModal);
  const acknowledgeUnlock = useStore((s) => s.acknowledgeUnlock);
  const isNew = useStore((s) => s.newlyUnlocked.has(enigma.id));
  const ref = useRef<HTMLDivElement>(null);

  const isLocked = !state.unlocked && !state.solved;
  const isSolved = state.solved;

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

      {/* Admin unlock button */}
      {isAdmin && isLocked && (
        <button
          onClick={handleAdminUnlock}
          className="absolute bottom-2 z-10 px-2 py-0.5 text-[0.55rem] rounded-full bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
        >
          unlock
        </button>
      )}

      {/* Rune */}
      <div className="absolute bottom-2.5 text-[0.65rem] opacity-20 tracking-[0.1em] text-accent">
        {enigma.rune}
      </div>
    </div>
  );
}

export function triggerUnlockEffect(id: string, enigmaTitle: string) {
  const store = useStore.getState();
  if (store.enigmas[id]?.unlocked || store.enigmas[id]?.solved) return;

  store.unlock(id);
  store.showToast(`✦ « ${enigmaTitle} » déverrouillé !`);
  sndUnlock();

  setTimeout(() => {
    const el = document.querySelector(`[data-card-id="${id}"]`);
    if (el) {
      // Auto-scroll vers la carte déverrouillée
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Animation d'apparition (unlock-flash)
      const card = el.firstElementChild as HTMLElement | null;
      if (card) {
        card.style.animation = "unlock-flash 0.7s ease-out";
        card.addEventListener("animationend", () => {
          card.style.animation = "";
        }, { once: true });
      }

      const r = el.getBoundingClientRect();
      spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 28, "#9b6dff");
    }
  }, 300);
}
