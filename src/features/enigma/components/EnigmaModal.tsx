import React, { useEffect, useRef, useState } from "react";
import { sndAnalysis, sndBad, sndClick, sndDoubt, sndLoveReveal, sndOk } from "@/audio";
import { randomVisual } from "@/utils/random";
import { Input } from "@components/ui/Input";
import { CooldownLabel } from "@features/cooldown/components/CooldownLabel";
import { isAttemptUsedToday, useCooldownStore } from "@features/cooldown/store";
import { ENIGMA_LIST, type Enigma } from "@features/enigma/config";
import { useEnigmaOrchestrator } from "@features/enigma/hooks/useEnigmaOrchestrator";
import { useEnigmaStore } from "@features/enigma/store";
import { ERROR_FEEDBACK_MS, INPUT_FOCUS_DELAY_MS, SOLVE_FEEDBACK_MS, SUSPENSE_MS } from "@features/enigma/timings";
import type { EnigmaLifecycleEvents } from "@features/enigma/types";
import { DoubtOverlay } from "./DoubtOverlay";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll(/[^\da-z]/g, "");
}

function ModalBody({
  enigma,
  isSolved,
  attemptUsed,
  isOpen,
  lifecycle,
}: Readonly<{
  enigma: Enigma;
  isSolved: boolean;
  attemptUsed: boolean;
  isOpen: boolean;
  /** Événements lifecycle émis au parent orchestrateur */
  lifecycle: EnigmaLifecycleEvents;
}>): React.JSX.Element {
  const lastAttempt = useCooldownStore((s) => s.lastAttempt);
  const closeModal = useEnigmaStore((s) => s.closeModal);
  const openLoveLetter = useEnigmaStore((s) => s.openLoveLetter);
  const isLetterRead = useEnigmaStore((s) => s.readLetters[enigma.id]);

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "err" | "suspense" | null>(isSolved ? "ok" : null);
  const [feedbackMsg, setFeedbackMsg] = useState(isSolved ? "✦ Le grimoire a déjà accepté ta réponse" : "");
  const [isShaking, setIsShaking] = useState(false);
  const [suspenseProgress, setSuspenseProgress] = useState(0);
  const [isShowingDoubt, setIsShowingDoubt] = useState(false);
  const suspenseRef = useRef<{
    interval: ReturnType<typeof setInterval>;
    timeout: ReturnType<typeof setTimeout>;
    startTime: number;
    elapsed: number;
  } | null>(null);
  const stopAnalysisRef = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startTime: number; currentY: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!isSolved) {
      const timer = setTimeout(() => inputRef.current?.focus(), INPUT_FOCUS_DELAY_MS);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isSolved]);

  function onDragStart(clientY: number): void {
    dragState.current = { startY: clientY, startTime: Date.now(), currentY: clientY };
    setIsDragging(true);
  }
  function onDragMove(clientY: number): void {
    if (!dragState.current) {
      return;
    }
    dragState.current.currentY = clientY;
    setDragOffset(Math.max(0, clientY - dragState.current.startY));
  }
  function onDragEnd(): void {
    if (!dragState.current) {
      return;
    }
    const dragOffsetY = dragState.current.currentY - dragState.current.startY;
    const dragDuration = Date.now() - dragState.current.startTime;
    dragState.current = null;
    setIsDragging(false);

    if (dragOffsetY / Math.max(dragDuration, 1) > 0.5 || dragOffsetY > (sheetRef.current?.offsetHeight ?? 400) * 0.4) {
      sndClick();
      closeModal();
    }
    setDragOffset(0);
  }

  function handleTouchStart(e: React.TouchEvent): void {
    onDragStart(e.touches[0].clientY);
  }
  function handleTouchMove(e: React.TouchEvent): void {
    onDragMove(e.touches[0].clientY);
  }
  function handleTouchEnd(): void {
    onDragEnd();
  }
  function handleMouseDown(e: React.MouseEvent): void {
    onDragStart(e.clientY);
    // eslint-disable-next-line unicorn/consistent-function-scoping -- must capture fresh onDragMove ref
    const handleMove = (ev: MouseEvent): void => {
      onDragMove(ev.clientY);
    };
    const handleUp = (): void => {
      onDragEnd();
      globalThis.removeEventListener("mousemove", handleMove);
      globalThis.removeEventListener("mouseup", handleUp);
    };
    globalThis.addEventListener("mousemove", handleMove);
    globalThis.addEventListener("mouseup", handleUp);
  }

  function startSuspenseTimer(offsetMs: number, startTime: number): void {
    const startList = startTime - offsetMs;
    const interval = setInterval(() => {
      setSuspenseProgress(Math.min((Date.now() - startList) / SUSPENSE_MS, 1));
    }, 50);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setSuspenseProgress(1);
      suspenseRef.current = null;
      resolve();
    }, SUSPENSE_MS - offsetMs);
    suspenseRef.current = { interval, timeout, startTime: startList, elapsed: offsetMs };
  }

  function pauseSuspense(): void {
    if (!suspenseRef.current) {
      return;
    }
    clearInterval(suspenseRef.current.interval);
    clearTimeout(suspenseRef.current.timeout);
    suspenseRef.current.elapsed = Date.now() - suspenseRef.current.startTime;
  }

  function submit(startTime: number, decisionRandom: number, timingRandom: number): void {
    if (isSolved || attemptUsed || feedback === "suspense") {
      return;
    }
    const isCorrect = normalize(value) === normalize(enigma.answer);
    const shouldShowDoubt = decisionRandom < (isCorrect ? 0.4 : 0.6);

    setFeedback("suspense");
    setFeedbackMsg("Le grimoire analyse ta réponse…");
    setSuspenseProgress(0);
    stopAnalysisRef.current = sndAnalysis();
    startSuspenseTimer(0, startTime);

    if (shouldShowDoubt) {
      const doubtAt = SUSPENSE_MS * (0.6 + timingRandom * 0.3);

      setTimeout(() => {
        pauseSuspense();
        stopAnalysisRef.current?.();
        stopAnalysisRef.current = null;
        sndDoubt();
        setFeedbackMsg("Les runes hésitent…");
        setIsShowingDoubt(true);
      }, doubtAt);
    }
  }

  function confirmDoubt(startTime: number): void {
    sndClick();
    setIsShowingDoubt(false);
    setFeedbackMsg("Le grimoire reprend son analyse…");
    const elapsed = suspenseRef.current?.elapsed ?? SUSPENSE_MS / 2;
    stopAnalysisRef.current = sndAnalysis(elapsed / 1000);
    startSuspenseTimer(elapsed, startTime);
  }

  function cancelDoubt(): void {
    sndClick();
    setIsShowingDoubt(false);
    setFeedback(null);
    setFeedbackMsg("");
    setSuspenseProgress(0);
    suspenseRef.current = null;
    stopAnalysisRef.current = null;
  }

  function resolve(): void {
    const isCorrect = normalize(value) === normalize(enigma.answer);

    // Émettre onTry au parent (enregistre la tentative / cooldown)
    lifecycle.onTry?.(enigma.id, value);

    if (isCorrect) {
      setFeedback("ok");
      setFeedbackMsg("✦ Les runes s'illuminent… le grimoire accepte ta réponse !");
      sndOk();
      // Émettre onSuccess au parent (celebrate + fermer modale)
      setTimeout(() => lifecycle.onSuccess?.(enigma.id), SOLVE_FEEDBACK_MS);
    } else {
      setFeedback("err");
      setFeedbackMsg("Les runes se sont éteintes… ce n'est pas le bon mot.");
      sndBad();
      // Émettre onFail au parent
      lifecycle.onFail?.(enigma.id);
      setIsShaking(true);

      setTimeout(() => {
        setFeedback(null);
        setFeedbackMsg("");
        setIsShaking(false);
      }, ERROR_FEEDBACK_MS);
    }
  }

  const isSuspense = feedback === "suspense";
  const inputState = (() => {
    if (feedback === "ok") {
      return "success" as const;
    }

    if (feedback === "err") {
      return "danger" as const;
    }

    if (isSuspense) {
      return "loading" as const;
    }

    return "default" as const;
  })();

  const translateClass = (() => {
    if (hasEntered && isOpen && !isDragging) {
      return "translate-y-0";
    }

    if (isDragging) {
      return "";
    }

    return "translate-y-full";
  })();

  return (
    <div
      ref={sheetRef}
      className={`mx-auto w-full max-w-[430px] rounded-t-3xl border ${isSolved ? "border-[#d4a94250]" : "border-[#3a2a5a]"} relative overflow-hidden border-b-0 px-[22px] pt-7 pb-11 ${isDragging ? "" : "transition-transform duration-400"} ${translateClass} ${isShaking ? "animate-[shake_0.42s_ease]" : ""}`}
      style={{
        background: isSolved
          ? "linear-gradient(180deg, #1a1508, #100c04)"
          : "linear-gradient(180deg, #1c1438, #100d20)",
        ...(isSolved && { boxShadow: "0 0 50px #e8c96a10" }),
        ...(!isDragging && { transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }),
        ...(isDragging && { transform: `translateY(${String(dragOffset)}px)` }),
      }}
    >
      {/* Drag handle */}
      <div
        className="items-startList absolute top-0 right-0 left-0 flex h-10 cursor-grab touch-none justify-center pt-2.5 active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        aria-label="Faire glisser pour fermer"
      >
        <div className={`h-[3.5px] w-[38px] rounded-sm ${isSolved ? "bg-[#c9a03240]" : "bg-[#3a2a5a]"}`} />
      </div>

      {/* Bouton fermer */}
      <button
        onClick={() => {
          sndClick();
          closeModal();
        }}
        className={`absolute top-[18px] right-4 z-10 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border text-[0.8rem] ${isSolved ? "border-[#c9a03230] bg-white/4 text-[#c9a032]/60" : "text-muted border-[#3a2a5a] bg-white/4"}`}
      >
        ✕
      </button>

      <div
        className={`mb-1.5 text-center text-[2.8rem] ${isSolved ? "drop-shadow-[0_0_14px_rgba(201,160,50,0.45)]" : "drop-shadow-[0_0_14px_rgba(155,109,255,0.5)]"}`}
      >
        {enigma.icon}
      </div>
      <h2 className="text-gold mb-5 text-center text-[1.05rem] font-[var(--font-cinzel-decorative)] drop-shadow-[0_0_20px_#e8c96a35]">
        {enigma.title}
      </h2>
      <p
        className={`mb-5 rounded-[14px] border p-4 text-center text-[0.88rem] leading-relaxed whitespace-pre-line italic ${isSolved ? "text-text border-[#c9a03220] bg-[#e8c96a06]" : "text-text border-[#2e2248] bg-white/[0.03]"}`}
      >
        {enigma.question}
      </p>

      {!isSolved && !attemptUsed && (
        <>
          <Input
            ref={inputRef}
            state={inputState}
            placeholder="Murmure ta réponse ici…"
            value={value}
            disabled={isSuspense}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onSubmit={() => {
              submit(Date.now(), randomVisual(), randomVisual());
            }}
            className="text-text w-full rounded-[14px] border-[1.5px] bg-[#0d0a1a] px-4 py-3.5 text-center text-base tracking-[0.1em]"
          />

          {isSuspense ? (
            <div className="mt-4 mb-2">
              <p className="text-accent mb-3 animate-pulse text-center text-[0.72rem]">{feedbackMsg}</p>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#2e2248]">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-linear"
                  style={{
                    width: `${String(suspenseProgress * 100)}%`,
                    background: "linear-gradient(90deg, #6b4a97, #9b6dff, #c9a0ff)",
                    boxShadow: "0 0 8px #9b6dff60",
                  }}
                />
              </div>
              <div className="mt-3 flex justify-center gap-3">
                {["✦", "◆", "✧", "◇", "✦"].map((rune, i) => (
                  <span
                    key={i}
                    className="text-accent text-[0.7rem]"
                    style={{ animation: `pulse 1.2s ease-in-out ${String(i * 0.2)}s infinite`, opacity: 0.3 }}
                  >
                    {rune}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p
                className={`mt-2 h-3.5 text-center text-[0.72rem] transition-colors duration-300 ${feedback === "ok" ? "text-success" : ""} ${feedback === "err" ? "text-danger" : ""}`}
              >
                {feedbackMsg}
              </p>
              <div className="bg-success/10 border-success/20 mx-auto mt-2 mb-1 flex w-fit items-center justify-center gap-2 rounded-full border px-3 py-1.5">
                <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-success text-[0.72rem] font-semibold tracking-wide">
                  Le grimoire attend ta réponse
                </span>
              </div>
            </>
          )}
        </>
      )}

      {!isSolved && attemptUsed && (
        <div className="py-5 text-center">
          <div className="bg-danger/10 border-danger/20 mx-auto mb-3 flex w-fit items-center justify-center gap-2 rounded-full border px-3 py-1.5">
            <span className="bg-danger h-1.5 w-1.5 rounded-full" />
            <span className="text-danger text-[0.72rem] font-semibold tracking-wide">Le grimoire se repose…</span>
          </div>
          <p className="text-muted text-[0.72rem]">Prochaine tentative dans</p>
          <p className="text-accent mt-1.5 text-[1.4rem] font-[var(--font-cinzel)] tracking-[0.15em]">
            <CooldownLabel lastTriggeredAt={lastAttempt} />
          </p>
        </div>
      )}

      {isSolved ? (
        <>
          <div className="mx-auto mt-2 mb-1 flex w-fit items-center justify-center gap-2 rounded-full border border-[#c9a03225] bg-[#c9a03212] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a032]" />
            <span className="text-[0.72rem] font-semibold tracking-wide text-[#8a6a20]">Le grimoire t'a souri</span>
          </div>
          <button
            onClick={() => {
              sndLoveReveal();
              openLoveLetter(enigma.id);
            }}
            className={`relative mt-3 w-full cursor-pointer overflow-hidden rounded-[14px] py-4 text-[0.85rem] font-[var(--font-cinzel)] font-semibold tracking-[0.12em] uppercase ${isLetterRead ? "border" : "border-none text-[#3a2a1a]"}`}
            style={
              isLetterRead
                ? {
                    background: "linear-gradient(rgb(49 40 14), rgb(83 62 22))",
                    border: "1px solid #d4a94250",
                    boxShadow: "0 4px 12px rgba(232, 201, 106, 0.125)",
                    color: "#d4a942f2",
                  }
                : {
                    background: "linear-gradient(135deg, #f5d87a, #e8c96a, #c9a032)",
                    boxShadow: "0 4px 22px #e8c96a40, 0 0 40px #e8c96a20",
                    animation: "envelope-breathe 2.5s ease-in-out infinite",
                  }
            }
          >
            {!isLetterRead && (
              <div
                className="pointer-events-none absolute inset-0"
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
          onClick={() => {
            submit(Date.now(), randomVisual(), randomVisual());
          }}
          disabled={attemptUsed || isSuspense}
          className={`mt-3 w-full cursor-pointer rounded-[14px] border-none py-4 text-[0.85rem] font-[var(--font-cinzel)] font-semibold tracking-[0.12em] text-white uppercase transition-all duration-200 active:scale-[0.97] ${attemptUsed || isSuspense ? "cursor-not-allowed bg-gradient-to-br from-[#3a3a4a] to-[#2a2a3a] opacity-50" : "to-accent bg-gradient-to-br from-[#6b4a97] shadow-[0_4px_22px_#9b6dff28]"}`}
        >
          {(() => {
            if (attemptUsed) {
              return "Essai épuisé";
            }

            if (isSuspense) {
              return "Le grimoire réfléchit…";
            }

            return "Valider la Réponse ✦";
          })()}
        </button>
      )}

      <DoubtOverlay
        visible={isShowingDoubt}
        onConfirm={() => {
          confirmDoubt(Date.now());
        }}
        onCancel={cancelDoubt}
      />
    </div>
  );
}

export function EnigmaModal(): React.JSX.Element {
  const modalId = useEnigmaStore((s) => s.modalEnigmaId);
  const closingId = useEnigmaStore((s) => s.modalClosingId);
  const displayId = modalId ?? closingId;
  const state = useEnigmaStore((s) => (displayId ? s.enigmas[displayId] : null));
  const closeModal = useEnigmaStore((s) => s.closeModal);
  const lastAttempt = useCooldownStore((s) => s.lastAttempt);
  const lifecycle = useEnigmaOrchestrator();

  const isAttemptUsed = isAttemptUsedToday(lastAttempt);
  const enigma = displayId ? ENIGMA_LIST.find((e) => e.id === displayId) : null;
  const isOpen = !!modalId;
  const isSolved = state?.solved ?? false;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-end bg-black/82 backdrop-blur-[5px] transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      {enigma && (
        <ModalBody
          key={displayId}
          enigma={enigma}
          isSolved={isSolved}
          attemptUsed={isAttemptUsed}
          isOpen={isOpen}
          lifecycle={lifecycle}
        />
      )}
    </div>
  );
}
