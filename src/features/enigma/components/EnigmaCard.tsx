import { useRef, useEffect, useState } from "react";
import type { Enigma } from "../config";
import { useEnigmaStore } from "../store";
import { sndClick, sndVictory, sndGoldenSeal } from "../../../audio";
import { spawnCelebration } from "../../../particles";
import { CELEBRATION_SCROLL_SETTLE_MS, CELEBRATION_DURATION_MS } from "../timings";
import { triggerUnlockEffect, playUnlockCardEffect } from "../unlock";
import { LockIcon } from "../../../components/LockIcon";
import { LockedModal } from "./LockedModal";
import { Button } from "../../../components/ui/Button";
import { CornerOrnaments } from "../../../components/ui/CornerOrnaments";

export function EnigmaCard({ enigma, isAdmin }: { enigma: Enigma; isAdmin: boolean }) {
  const state = useEnigmaStore((s) => s.enigmas[enigma.id]);
  const openModal = useEnigmaStore((s) => s.openModal);
  const acknowledgeUnlock = useEnigmaStore((s) => s.acknowledgeUnlock);
  const relock = useEnigmaStore((s) => s.relock);
  const isCelebrating = useEnigmaStore((s) => s.celebrateCardId === enigma.id);
  const clearCelebrate = useEnigmaStore((s) => s.clearCelebrate);
  const showSuccessBox = useEnigmaStore((s) => s.showSuccessBox);
  const isNew = useEnigmaStore((s) => s.newlyUnlocked.has(enigma.id));
  const letterRead = useEnigmaStore((s) => s.readLetters[enigma.id]);
  const unlockingId = useEnigmaStore((s) => s.unlockingCardId);
  const ref = useRef<HTMLDivElement>(null);
  const [showLocked, setShowLocked] = useState(false);
  const prevUnlockingRef = useRef(unlockingId);
  const prevLetterReadRef = useRef(letterRead);

  const isLocked = !state.unlocked && !state.solved;
  const isSolved = state.solved;

  // SFX quand la carte atteint son état doré final (lettre lue)
  useEffect(() => {
    const wasUnread = !prevLetterReadRef.current;
    prevLetterReadRef.current = letterRead;
    if (wasUnread && letterRead) sndGoldenSeal();
  }, [letterRead]);

  // Quand l'overlay se ferme pour cette carte → scroll + flash + particules
  useEffect(() => {
    const wasUnlockingThis = prevUnlockingRef.current === enigma.id;
    prevUnlockingRef.current = unlockingId;

    if (wasUnlockingThis && unlockingId === null) {
      // Petit délai pour laisser l'overlay disparaître visuellement
      const timer = setTimeout(() => playUnlockCardEffect(enigma.id, enigma.title), 150);
      return () => clearTimeout(timer);
    }
  }, [unlockingId, enigma.id, enigma.title]);

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

      // Nettoyage après la célébration puis affichage de la modal succès
      clearTimer = setTimeout(() => {
        clearCelebrate();
        showSuccessBox(enigma.boxNumber, enigma.haEvent, enigma.id);
      }, CELEBRATION_DURATION_MS);
    }, CELEBRATION_SCROLL_SETTLE_MS);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [isCelebrating, clearCelebrate, showSuccessBox, enigma.boxNumber, enigma.haEvent, enigma.id]);

  function handleClick() {
    if (isLocked) {
      setShowLocked(true);
      return;
    }
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
    "aspect-[2/3] rounded-[18px] border-[1.5px] relative overflow-hidden flex flex-col items-center justify-center p-3 px-2 select-none transition-all duration-700";

  const stateClass = isSolved
    ? "border-[#c9a03245] shadow-[0_0_22px_#e8c96a20] cursor-pointer"
    : state.unlocked
      ? "border-unlocked-border cursor-pointer active:scale-[0.94]"
      : "border-locked-border grayscale brightness-[0.55]";

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
        ...(isSolved && !letterRead && {
          boxShadow: "inset 0 0 30px #e8c96a20, inset 0 0 60px #e8c96a10, 0 0 22px #e8c96a15",
        }),
      }}
      onClick={handleClick}
    >
      {/* Gold background overlay — fades in on solve */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-[1200ms] ease-in-out ${isSolved ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(155deg, #1a1508, #100c04)" }}
      />

      {/* Purple radial glow — fades out on solve */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-[1200ms] ${isSolved ? "opacity-0" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse at 50% 10%, #3a2a5a18, transparent 65%)" }}
      />
      {/* Gold radial glow — fades in on solve */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-[1200ms] ${isSolved ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse at 50% 50%, #e8c96a18, transparent 65%)" }}
      />

      {/* Corner decorations */}
      {!isLocked && (
        <CornerOrnaments color={isSolved ? "border-[#c9a03260]" : "border-unlocked-border"} size="w-2.5 h-2.5" offset="7px" opacity="opacity-45" className="transition-colors duration-700" />
      )}

      {/* Card content */}
      {isLocked ? (
        <>
          <LockIcon />
          <div className="text-[0.6rem] tracking-[0.2em] text-muted uppercase">
            Énigme {enigma.id}
          </div>
        </>
      ) : (
        <div className="relative z-[1] flex flex-col items-center">
          <div className={`text-[0.6rem] tracking-[0.2em] ${isSolved ? "text-gold/50" : "text-muted"} uppercase mb-2`}>
            Énigme {enigma.id}
          </div>
          <div className={`text-[2.3rem] mb-2 leading-none transition-[filter] duration-700 ${isSolved ? "drop-shadow-[0_0_10px_rgba(201,160,50,0.6)]" : "drop-shadow-[0_0_10px_rgba(155,109,255,0.6)]"}`}>
            {enigma.icon}
          </div>
          <div className={`text-[0.68rem] text-center tracking-wide leading-[1.45] transition-colors duration-700 ${isSolved ? "text-gold" : "text-text"}`}>
            {enigma.title}
          </div>
        </div>
      )}


      {/* Golden letter button — always rendered, transitions in */}
      {!letterRead && (
        <button
          onClick={(e) => { e.stopPropagation(); if (isSolved) { sndClick(); openModal(enigma.id); } }}
          className={`absolute w-80/100 bottom-4 p-2 mt-2 border-none rounded-[10px] text-[#3a2a1a] font-[var(--font-cinzel)] text-[0.6rem] font-semibold tracking-[0.1em] uppercase cursor-pointer overflow-hidden z-[2] transition-all duration-700 ease-out ${
            isSolved ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
          }`}
          style={{
            background: "linear-gradient(135deg, #f5d87a, #e8c96a, #c9a032)",
            boxShadow: "0 2px 12px #e8c96a40, 0 0 20px #e8c96a20",
            ...(isSolved && { animation: "envelope-breathe 2.5s ease-in-out infinite" }),
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "envelope-shimmer 3s ease-in-out infinite",
            }}
          />
          <span className="relative z-[1] flex items-center justify-center gap-1">
            <span className="text-[0.75rem]">✦</span>
            Une dernière chose pour toi...
          </span>
        </button>
      )}
      {/* Admin buttons */}
      {isAdmin && isLocked && (
        <Button variant="admin" color="accent" className="absolute bottom-2 z-10" onClick={handleAdminUnlock}>unlock</Button>
      )}
      {isAdmin && !isLocked && (
        <Button variant="admin" color="danger" className="absolute bottom-2 z-10" onClick={handleAdminRelock}>relock</Button>
      )}

      {/* Rune */}
      {!isSolved && (
        <div className={`absolute bottom-2.5 text-[0.65rem] opacity-20 tracking-[0.1em] text-accent`}>
          {enigma.rune}
        </div>
      )}

      {showLocked && <LockedModal onClose={() => setShowLocked(false)} />}
    </div>
  );
}
