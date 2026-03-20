import { useState, useRef, useEffect } from "react";
import { useStore, isAttemptUsedToday, msUntilMidnight } from "../store";
import { ENIGMAS, type Enigma } from "../config";
import { sndOk, sndBad, sndClick, sndLoveReveal, sndAnalysis, sndDoubt } from "../audio";
import { SOLVE_FEEDBACK_MS, INPUT_FOCUS_DELAY_MS, ERROR_FEEDBACK_MS, SUSPENSE_MS } from "../timings";

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
  const recordAttempt = useStore((s) => s.recordAttempt);
  const celebrate = useStore((s) => s.celebrate);
  const openLoveLetter = useStore((s) => s.openLoveLetter);
  const letterRead = useStore((s) => s.readLetters[enigma.id]);

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "err" | "suspense" | null>(
    isSolved ? "ok" : null,
  );
  const [feedbackMsg, setFeedbackMsg] = useState(
    isSolved ? "✦ Le grimoire a déjà accepté ta réponse" : "",
  );
  const [shaking, setShaking] = useState(false);
  const [suspenseProgress, setSuspenseProgress] = useState(0);
  const [showDoubt, setShowDoubt] = useState(false);
  const suspenseRef = useRef<{ interval: ReturnType<typeof setInterval>; timeout: ReturnType<typeof setTimeout>; startTime: number; elapsed: number } | null>(null);
  const stopAnalysisRef = useRef<(() => void) | null>(null);
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

  function startSuspenseTimer(offsetMs = 0) {
    const start = Date.now() - offsetMs;
    const remaining = SUSPENSE_MS - offsetMs;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setSuspenseProgress(Math.min(elapsed / SUSPENSE_MS, 1));
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setSuspenseProgress(1);
      suspenseRef.current = null;
      resolve();
    }, remaining);

    suspenseRef.current = { interval, timeout, startTime: start, elapsed: offsetMs };
    return { interval, timeout };
  }

  function pauseSuspense() {
    if (!suspenseRef.current) return;
    clearInterval(suspenseRef.current.interval);
    clearTimeout(suspenseRef.current.timeout);
    suspenseRef.current.elapsed = Date.now() - suspenseRef.current.startTime;
  }

  function submit() {
    if (isSolved || attemptUsed || feedback === "suspense") return;

    const isCorrect = normalize(value) === normalize(enigma.answer);
    const doubtChance = isCorrect ? 0.4 : 0.6;
    const willDoubt = Math.random() < doubtChance;

    setFeedback("suspense");
    setFeedbackMsg("Le grimoire analyse ta réponse…");
    setSuspenseProgress(0);
    stopAnalysisRef.current = sndAnalysis();

    startSuspenseTimer();

    // Entre 60% et 90% du suspense, peut-être afficher la modal de doute
    if (willDoubt) {
      const doubtAt = SUSPENSE_MS * (0.6 + Math.random() * 0.3);
      setTimeout(() => {
        pauseSuspense();
        stopAnalysisRef.current?.();
        stopAnalysisRef.current = null;
        sndDoubt();
        setFeedbackMsg("Les runes hésitent…");
        setShowDoubt(true);
      }, doubtAt);
    }
  }

  function confirmDoubt() {
    sndClick();
    setShowDoubt(false);
    setFeedbackMsg("Le grimoire reprend son analyse…");
    const elapsed = suspenseRef.current?.elapsed ?? SUSPENSE_MS / 2;
    stopAnalysisRef.current = sndAnalysis(elapsed / 1000);
    startSuspenseTimer(elapsed);
  }

  function cancelDoubt() {
    sndClick();
    setShowDoubt(false);
    setFeedback(null);
    setFeedbackMsg("");
    setSuspenseProgress(0);
    suspenseRef.current = null;
    stopAnalysisRef.current = null;
  }

  function resolve() {
    if (normalize(value) === normalize(enigma.answer)) {
      setFeedback("ok");
      setFeedbackMsg("✦ Les runes s'illuminent… le grimoire accepte ta réponse !");
      sndOk();
      recordAttempt();

      // Fermer la modale, puis déclencher la célébration visible
      // solve() sera appelé au clic "Compris !" dans la SuccessModal
      setTimeout(() => {
        closeModal();
        celebrate(enigma.id);
      }, SOLVE_FEEDBACK_MS);
    } else {
      setFeedback("err");
      setFeedbackMsg("Les runes se sont éteintes… ce n'est pas le bon mot.");
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

  const isSuspense = feedback === "suspense";

  const inputBorder =
    feedback === "ok"
      ? "border-success shadow-[0_0_14px_#4ecca328]"
      : feedback === "err"
        ? "border-danger shadow-[0_0_14px_#ff6b8a28]"
        : isSuspense
          ? "border-accent shadow-[0_0_14px_#9b6dff40]"
          : "border-[#3a2a5a] focus:border-accent focus:shadow-[0_0_14px_#9b6dff28]";

  return (
    <div
      ref={sheetRef}
      className={`w-full max-w-[430px] mx-auto rounded-t-3xl border ${isSolved ? "border-[#d4a94250]" : "border-[#3a2a5a]"} border-b-0 px-[22px] pt-7 pb-11 relative overflow-hidden ${
        isDragging ? "" : "transition-transform duration-400"
      } ${entered && isOpen && !isDragging ? "translate-y-0" : !isDragging ? "translate-y-full" : ""} ${shaking ? "animate-[shake_0.42s_ease]" : ""}`}
      style={{
        background: isSolved
          ? "linear-gradient(180deg, #1a1508, #100c04)"
          : "linear-gradient(180deg, #1c1438, #100d20)",
        ...(isSolved && { boxShadow: "0 0 50px #e8c96a10" }),
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
        <div className={`w-[38px] h-[3.5px] rounded-sm ${isSolved ? "bg-[#c9a03240]" : "bg-[#3a2a5a]"}`} />
      </div>

      {/* Close button */}
      <button
        onClick={() => { sndClick(); closeModal(); }}
        className={`absolute top-[18px] right-4 w-[30px] h-[30px] rounded-full flex items-center justify-center cursor-pointer text-[0.8rem] z-10 border ${
          isSolved
            ? "bg-white/4 border-[#c9a03230] text-[#c9a032]/60"
            : "bg-white/4 border-[#3a2a5a] text-muted"
        }`}
      >
        ✕
      </button>

      <div className={`text-[2.8rem] text-center mb-1.5 ${isSolved ? "drop-shadow-[0_0_14px_rgba(201,160,50,0.45)]" : "drop-shadow-[0_0_14px_rgba(155,109,255,0.5)]"}`}>
        {enigma.icon}
      </div>
      <h2
        className={`font-[var(--font-cinzel-decorative)] text-[1.05rem] text-center mb-5 ${
          isSolved ? "text-gold drop-shadow-[0_0_20px_#e8c96a40]" : "text-gold drop-shadow-[0_0_20px_#e8c96a35]"
        }`}
      >
        {enigma.title}
      </h2>
      <p
        className={`text-[0.88rem] leading-relaxed text-center mb-5 p-4 rounded-[14px] whitespace-pre-line border italic ${
          isSolved
            ? "text-text bg-[#e8c96a06] border-[#c9a03220]"
            : "text-text bg-white/[0.03] border-[#2e2248]"
        }`}
      >
        {enigma.question}
      </p>

      {!isSolved && !attemptUsed && (
        <>
          <input
            ref={inputRef}
            type="text"
            placeholder="Murmure ta réponse ici…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            disabled={isSuspense}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`w-full bg-[#0d0a1a] border-[1.5px] rounded-[14px] py-3.5 px-4 text-base text-text font-[var(--font-cinzel)] text-center outline-none transition-all duration-300 tracking-[0.1em] ${inputBorder}`}
          />

          {isSuspense ? (
            <div className="mt-4 mb-2">
              <p className="text-center text-[0.72rem] text-accent mb-3 animate-pulse">
                {feedbackMsg}
              </p>
              {/* Progress bar */}
              <div className="w-full h-[3px] rounded-full bg-[#2e2248] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-linear"
                  style={{
                    width: `${suspenseProgress * 100}%`,
                    background: "linear-gradient(90deg, #6b4a97, #9b6dff, #c9a0ff)",
                    boxShadow: "0 0 8px #9b6dff60",
                  }}
                />
              </div>
              {/* Scanning runes */}
              <div className="flex justify-center gap-3 mt-3">
                {["✦", "◆", "✧", "◇", "✦"].map((rune, i) => (
                  <span
                    key={i}
                    className="text-[0.7rem] text-accent"
                    style={{
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.3,
                    }}
                  >
                    {rune}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
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
                  Le grimoire attend ta réponse
                </span>
              </div>
            </>
          )}
        </>
      )}

      {!isSolved && attemptUsed && (
        <div className="text-center py-5">
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-danger/10 border border-danger/20 w-fit mx-auto mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            <span className="text-[0.72rem] text-danger font-semibold tracking-wide">
              Le grimoire se repose…
            </span>
          </div>
          <p className="text-[0.72rem] text-muted">
            Prochaine tentative dans
          </p>
          <p className="text-[1.4rem] font-[var(--font-cinzel)] text-accent tracking-[0.15em] mt-1.5">
            {countdown}
          </p>
        </div>
      )}

      {isSolved ? (
        <>
          <div className="flex items-center justify-center gap-2 mt-2 mb-1 py-1.5 px-3 rounded-full bg-[#c9a03212] border border-[#c9a03225] w-fit mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a032]" />
            <span className="text-[0.72rem] text-[#8a6a20] font-semibold tracking-wide">
              Le grimoire t'a souri
            </span>
          </div>
          <button
            onClick={() => { sndLoveReveal(); openLoveLetter(enigma.id); }}
            className={`w-full mt-3 py-4 rounded-[14px] font-[var(--font-cinzel)] text-[0.85rem] font-semibold tracking-[0.12em] uppercase cursor-pointer relative overflow-hidden ${letterRead ? "border" : "border-none text-[#3a2a1a]"}`}
            style={letterRead ? {
              background: "linear-gradient(rgb(49 40 14), rgb(83 62 22))",
              border: "1px solid #d4a94250",
              boxShadow: "0 4px 12px rgba(232, 201, 106, 0.125)",
              color: "#d4a942f2",
            } : {
              background: "linear-gradient(135deg, #f5d87a, #e8c96a, #c9a032)",
              boxShadow: "0 4px 22px #e8c96a40, 0 0 40px #e8c96a20",
              animation: "envelope-breathe 2.5s ease-in-out infinite",
            }}
          >
            {!letterRead && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "envelope-shimmer 3s ease-in-out infinite",
                }}
              />
            )}
            <span className="relative z-1 flex items-center justify-center gap-2">
              <span className="text-[1.1rem]">💌</span>
              Ouvrir ta lettre
            </span>
          </button>
        </>
      ) : (
        <button
          onClick={submit}
          disabled={attemptUsed || isSuspense}
          className={`w-full mt-3 py-4 border-none rounded-[14px] text-white font-[var(--font-cinzel)] text-[0.85rem] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.97] ${
            attemptUsed || isSuspense
              ? "bg-gradient-to-br from-[#3a3a4a] to-[#2a2a3a] opacity-50 cursor-not-allowed"
              : "bg-gradient-to-br from-[#6b4a97] to-accent shadow-[0_4px_22px_#9b6dff28]"
          }`}
        >
          {attemptUsed ? "Essai épuisé" : isSuspense ? "Le grimoire réfléchit…" : "Valider la Réponse ✦"}
        </button>
      )}

      {/* Doubt backdrop — covers the sheet behind */}
      <div
        className={`absolute inset-0 z-[19] rounded-t-3xl transition-opacity duration-500 ${
          showDoubt ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(6, 4, 14, 0.92)", backdropFilter: "blur(8px)" }}
      />

      {/* Modal de doute — grimoire divination */}
      <div
        className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-accent/15 transition-all duration-500 ${
          showDoubt ? "opacity-100 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(30, 20, 60, 0.98), rgba(10, 8, 20, 0.99))",
          boxShadow: "0 -4px 30px rgba(155, 109, 255, 0.08), 0 0 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Floating dust particles */}
        {showDoubt && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full bg-accent/60"
                style={{
                  left: `${15 + i * 10}%`,
                  bottom: `${10 + (i % 3) * 20}%`,
                  animation: `doubt-dust ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative flex flex-col items-center px-6 pt-6 pb-7 text-center">
          {/* Orbiting rune circles */}
          {showDoubt && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] pointer-events-none">
              <div
                className="absolute inset-0"
                style={{ animation: "doubt-orbit 12s linear infinite" }}
              >
                {["᛭", "ᚱ", "ᛟ", "ᚦ", "ᛈ", "ᚹ"].map((rune, i) => (
                  <span
                    key={i}
                    className="absolute text-[0.5rem] text-accent/30 font-light"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${i * 60}deg) translateY(-66px) rotate(-${i * 60}deg)`,
                      animation: `doubt-glyph-pulse 2.5s ease-in-out ${i * 0.4}s infinite`,
                    }}
                  >
                    {rune}
                  </span>
                ))}
              </div>
              <div
                className="absolute inset-[20%]"
                style={{ animation: "doubt-orbit-reverse 8s linear infinite" }}
              >
                {["✧", "◇", "✦", "◆"].map((sym, i) => (
                  <span
                    key={i}
                    className="absolute text-[0.4rem] text-accent/20"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `rotate(${i * 90 + 45}deg) translateY(-36px) rotate(-${i * 90 + 45}deg)`,
                      animation: `doubt-glyph-pulse 2s ease-in-out ${i * 0.5 + 0.2}s infinite`,
                    }}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Central symbol */}
          <div
            className="text-[2rem] mb-3 text-accent/70"
            style={showDoubt ? { animation: "doubt-core-breathe 3s ease-in-out infinite" } : undefined}
          >
            ✦
          </div>

          {/* Title */}
          <p
            className="font-[var(--font-cinzel-decorative)] text-[1rem] text-accent/70 mb-1.5 tracking-[0.15em] uppercase"
            style={showDoubt ? { animation: "doubt-text-in 0.6s ease-out 0.1s both" } : undefined}
          >
            Le grimoire hésite
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div
              className="h-[1px] w-8 bg-gradient-to-r from-transparent to-accent/30 origin-right"
              style={showDoubt ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
            <span className="text-[0.35rem] text-accent/25">◆</span>
            <div
              className="h-[1px] w-8 bg-gradient-to-l from-transparent to-accent/30 origin-left"
              style={showDoubt ? { animation: "doubt-line-grow 0.5s ease-out 0.3s both" } : undefined}
            />
          </div>

          {/* Question text */}
          <p
            className="font-[var(--font-cinzel)] text-[0.90rem] text-text/80 leading-relaxed"
            style={showDoubt ? { animation: "doubt-text-in 0.6s ease-out 0.25s both" } : undefined}
          >
            Es-tu certaine de vouloir soumettre<br />
            <span className="text-accent/60 text-[0.85rem]">cette réponse aux runes ?</span>
          </p>
        </div>

        {/* Buttons — anchored at bottom */}
        <div
          className="relative px-5 pb-8 pt-3 flex gap-3"
          style={showDoubt ? { animation: "doubt-btn-in 0.5s ease-out 0.45s both" } : undefined}
        >
          <button
            onClick={cancelDoubt}
            className="flex-1 py-3.5 rounded-[12px] border border-[#3a2a5a60] text-text/70 font-[var(--font-cinzel)] text-[0.68rem] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.94] relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(30, 22, 55, 0.8), rgba(16, 12, 32, 0.9))",
            }}
          >
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              <span className="text-accent/30 text-[0.5rem]">◁</span>
              Reformuler
            </span>
          </button>
          <button
            onClick={confirmDoubt}
            className="flex-1 py-3.5 rounded-[12px] border-none text-white font-[var(--font-cinzel)] text-[0.68rem] font-semibold tracking-[0.1em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.94] relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #5a3a8a, #7b5dbd)",
              boxShadow: "0 4px 20px #9b6dff25, inset 0 1px 0 #ffffff10",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "envelope-shimmer 3s ease-in-out infinite",
              }}
            />
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              J'en suis sûre
              <span className="text-[0.5rem]">✦</span>
            </span>
          </button>
        </div>
      </div>
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
