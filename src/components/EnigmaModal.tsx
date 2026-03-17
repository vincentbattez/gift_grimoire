import { useState, useRef, useEffect } from "react";
import { useStore, isAttemptUsedToday, msUntilMidnight } from "../store";
import { ENIGMAS, type Enigma } from "../config";
import { sndOk, sndBad, sndClick } from "../audio";
import { fireEvent } from "../ha";
import { SOLVE_FEEDBACK_MS, INPUT_FOCUS_DELAY_MS, ERROR_FEEDBACK_MS } from "../timings";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function ModalBody({
  enigma,
  isSolved,
  attemptUsed,
  countdown,
  isOpen,
}: {
  enigma: Enigma;
  isSolved: boolean;
  attemptUsed: boolean;
  countdown: string;
  isOpen: boolean;
}) {
  const closeModal = useStore((s) => s.closeModal);
  const solve = useStore((s) => s.solve);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const celebrate = useStore((s) => s.celebrate);

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "err" | null>(
    isSolved ? "ok" : null,
  );
  const [feedbackMsg, setFeedbackMsg] = useState(
    isSolved ? "✦ Énigme déjà résolue !" : "",
  );
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startTime: number;
    currentY: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Déclenche l'animation d'entrée au prochain frame
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!isSolved) {
      const timer = setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isSolved]);

  function onDragStart(clientY: number) {
    dragState.current = { startY: clientY, startTime: Date.now(), currentY: clientY };
    setIsDragging(true);
  }

  function onDragMove(clientY: number) {
    if (!dragState.current) return;
    dragState.current.currentY = clientY;
    const dy = Math.max(0, clientY - dragState.current.startY);
    setDragOffset(dy);
  }

  function onDragEnd() {
    if (!dragState.current) return;
    const dy = dragState.current.currentY - dragState.current.startY;
    const dt = Date.now() - dragState.current.startTime;
    const velocity = dy / Math.max(dt, 1);

    dragState.current = null;
    setIsDragging(false);

    const sheetH = sheetRef.current?.offsetHeight ?? 400;
    if (velocity > 0.5 || dy > sheetH * 0.4) {
      sndClick();
      closeModal();
    }
    setDragOffset(0);
  }

  function handleTouchStart(e: React.TouchEvent) {
    onDragStart(e.touches[0].clientY);
  }
  function handleTouchMove(e: React.TouchEvent) {
    onDragMove(e.touches[0].clientY);
  }
  function handleTouchEnd() {
    onDragEnd();
  }
  function handleMouseDown(e: React.MouseEvent) {
    onDragStart(e.clientY);
    const onMove = (ev: MouseEvent) => onDragMove(ev.clientY);
    const onUp = () => {
      onDragEnd();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function submit() {
    if (isSolved || attemptUsed) return;

    if (normalize(value) === normalize(enigma.answer)) {
      setFeedback("ok");
      setFeedbackMsg("✦ Énigme résolue avec succès !");
      sndOk();
      recordAttempt();
      solve(enigma.id);
      fireEvent(enigma.haEvent);

      // Fermer la modale, puis déclencher la célébration visible
      setTimeout(() => {
        closeModal();
        celebrate(enigma.id);
      }, SOLVE_FEEDBACK_MS);
    } else {
      setFeedback("err");
      setFeedbackMsg("Ce n'est pas la bonne réponse…");
      sndBad();
      recordAttempt();
      setShaking(true);
      setTimeout(() => {
        setFeedback(null);
        setFeedbackMsg("");
        setShaking(false);
      }, ERROR_FEEDBACK_MS);
    }
  }

  const inputBorder =
    feedback === "ok"
      ? "border-success shadow-[0_0_14px_#4ecca328]"
      : feedback === "err"
        ? "border-danger shadow-[0_0_14px_#ff6b8a28]"
        : "border-[#3a2a5a] focus:border-accent focus:shadow-[0_0_14px_#9b6dff28]";

  return (
    <div
      ref={sheetRef}
      className={`w-full max-w-[430px] mx-auto rounded-t-3xl border border-[#3a2a5a] border-b-0 px-[22px] pt-7 pb-11 relative overflow-hidden ${
        isDragging ? "" : "transition-transform duration-400"
      } ${entered && isOpen && !isDragging ? "translate-y-0" : !isDragging ? "translate-y-full" : ""} ${shaking ? "animate-[shake_0.42s_ease]" : ""}`}
      style={{
        background: "linear-gradient(180deg, #1c1438, #100d20)",
        ...(!isDragging && { transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }),
        ...(isDragging && { transform: `translateY(${dragOffset}px)` }),
      }}
    >
      {/* Drag handle */}
      <div
        className="absolute top-0 left-0 right-0 h-10 cursor-grab active:cursor-grabbing touch-none flex items-start justify-center pt-2.5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        aria-label="Faire glisser pour fermer"
      >
        <div className="w-[38px] h-[3.5px] bg-[#3a2a5a] rounded-sm" />
      </div>

      {/* Close button */}
      <button
        onClick={() => { sndClick(); closeModal(); }}
        className="absolute top-[18px] right-4 w-[30px] h-[30px] bg-white/4 border border-[#3a2a5a] rounded-full flex items-center justify-center cursor-pointer text-muted text-[0.8rem] z-10"
      >
        ✕
      </button>

      <div className="text-[2.8rem] text-center mb-1.5 drop-shadow-[0_0_14px_rgba(155,109,255,0.5)]">
        {enigma.icon}
      </div>
      <h2 className="font-[var(--font-cinzel-decorative)] text-[1.05rem] text-gold text-center mb-5 drop-shadow-[0_0_20px_#e8c96a35]">
        {enigma.title}
      </h2>
      <p className="text-[0.88rem] leading-relaxed text-text text-center mb-5 p-4 bg-white/[0.03] rounded-[14px] border border-[#2e2248] italic">
        {enigma.question}
      </p>

      {!isSolved && !attemptUsed && (
        <>
          <input
            ref={inputRef}
            type="text"
            placeholder="Votre réponse…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`w-full bg-[#0d0a1a] border-[1.5px] rounded-[14px] py-3.5 px-4 text-base text-text font-[var(--font-cinzel)] text-center outline-none transition-all duration-300 tracking-[0.1em] ${inputBorder}`}
          />

          <p
            className={`text-center text-[0.72rem] mt-2 h-3.5 transition-colors duration-300 ${
              feedback === "ok" ? "text-success" : feedback === "err" ? "text-danger" : ""
            }`}
          >
            {feedbackMsg}
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 mb-1 py-1.5 px-3 rounded-full bg-success/10 border border-success/20 w-fit mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[0.72rem] text-success font-semibold tracking-wide">
              1 essai disponible
            </span>
          </div>
        </>
      )}

      {!isSolved && attemptUsed && (
        <div className="text-center py-5">
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-danger/10 border border-danger/20 w-fit mx-auto mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            <span className="text-[0.72rem] text-danger font-semibold tracking-wide">
              0 essai disponible
            </span>
          </div>
          <p className="text-[0.72rem] text-muted">
            Prochain essai dans
          </p>
          <p className="text-[1.4rem] font-[var(--font-cinzel)] text-accent tracking-[0.15em] mt-1.5">
            {countdown}
          </p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={isSolved || attemptUsed}
        className={`w-full mt-3 py-4 border-none rounded-[14px] text-white font-[var(--font-cinzel)] text-[0.85rem] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.97] ${
          isSolved
            ? "bg-gradient-to-br from-[#2a6a4a] to-success shadow-[0_4px_22px_#4ecca328]"
            : attemptUsed
              ? "bg-gradient-to-br from-[#3a3a4a] to-[#2a2a3a] opacity-50 cursor-not-allowed"
              : "bg-gradient-to-br from-[#6b4a97] to-accent shadow-[0_4px_22px_#9b6dff28]"
        }`}
      >
        {isSolved ? "✦ Énigme Résolue ✦" : attemptUsed ? "Essai épuisé" : "Valider la Réponse ✦"}
      </button>
    </div>
  );
}

export function EnigmaModal() {
  const modalId = useStore((s) => s.modalEnigmaId);
  const closingId = useStore((s) => s.modalClosingId);
  const displayId = modalId ?? closingId;
  const state = useStore((s) => (displayId ? s.enigmas[displayId] : null));
  const closeModal = useStore((s) => s.closeModal);
  const lastAttempt = useStore((s) => s.lastAttempt);

  const attemptUsed = isAttemptUsedToday(lastAttempt);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!attemptUsed) return;
    function tick() {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [attemptUsed]);

  const enigma = displayId ? ENIGMAS.find((e) => e.id === displayId) : null;
  const isOpen = !!modalId;
  const isSolved = state?.solved ?? false;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) closeModal();
  }

  return (
    <div
      className={`fixed inset-0 z-100 bg-black/82 backdrop-blur-[5px] flex items-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOverlayClick}
    >
      {enigma && (
        <ModalBody
          key={displayId}
          enigma={enigma}
          isSolved={isSolved}
          attemptUsed={attemptUsed}
          countdown={countdown}
          isOpen={isOpen}
        />
      )}
    </div>
  );
}
