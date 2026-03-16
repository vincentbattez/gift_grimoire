import { useRef } from "react";
import type { Enigma } from "../config";
import { useStore } from "../store";
import { sndClick, sndUnlock } from "../audio";
import { spawnParticles } from "./Starfield";

export function SpellCard({ enigma }: { enigma: Enigma }) {
  const state = useStore((s) => s.enigmas[enigma.id]);
  const openModal = useStore((s) => s.openModal);
  const ref = useRef<HTMLDivElement>(null);

  const isLocked = !state.unlocked && !state.solved;
  const isSolved = state.solved;

  function handleClick() {
    if (isLocked) return;
    sndClick();
    openModal(enigma.id);
  }

  const base =
    "aspect-[2/3] rounded-[18px] border-[1.5px] relative overflow-hidden flex flex-col items-center justify-center p-3 px-2 select-none transition-all duration-400";

  const stateClass = isSolved
    ? "border-solved-border shadow-[0_0_22px_#4ecca340,inset_0_0_16px_#4ecca310] cursor-pointer"
    : state.unlocked
      ? "border-unlocked-border shadow-[0_0_22px_#7b5ea728,inset_0_0_16px_#7b5ea70c] cursor-pointer active:scale-[0.94]"
      : "border-locked-border grayscale brightness-[0.35]";

  return (
    <div
      ref={ref}
      className={`${base} ${stateClass}`}
      style={{
        background: "linear-gradient(155deg, #130f26, #0b0917)",
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
            Sort {enigma.id}
          </div>
        </>
      ) : (
        <>
          <div className="text-[0.6rem] tracking-[0.2em] text-muted uppercase mb-2">
            Sort {enigma.id}
          </div>
          <div className="text-[2.3rem] mb-2 leading-none drop-shadow-[0_0_10px_rgba(155,109,255,0.6)]">
            {enigma.icon}
          </div>
          <div className="text-[0.68rem] text-center text-text tracking-wide leading-[1.45]">
            {enigma.title}
          </div>
        </>
      )}

      {/* Rune */}
      <div className="absolute bottom-2.5 text-[0.65rem] opacity-20 tracking-[0.1em] text-accent">
        {enigma.rune}
      </div>
    </div>
  );
}

export function triggerUnlockEffect(id: number, enigmaTitle: string) {
  const store = useStore.getState();
  if (store.enigmas[id]?.unlocked || store.enigmas[id]?.solved) return;

  store.unlock(id);
  sndUnlock();
  store.showToast(`✦ « ${enigmaTitle} » déverrouillé !`);

  setTimeout(() => {
    const el = document.querySelector(`[data-card-id="${id}"]`);
    if (el) {
      el.classList.add("animate-unlock");
      el.addEventListener("animationend", () => el.classList.remove("animate-unlock"), { once: true });
      const r = el.getBoundingClientRect();
      spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 28, "#9b6dff");
    }
  }, 150);
}
