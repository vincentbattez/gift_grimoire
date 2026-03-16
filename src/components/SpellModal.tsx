import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import { ENIGMAS } from "../config";
import { sndOk, sndBad, sndClick } from "../audio";
import { fireEvent } from "../ha";
import { spawnParticles } from "./Starfield";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SpellModal() {
  const modalId = useStore((s) => s.modalEnigmaId);
  const state = useStore((s) => (modalId ? s.enigmas[modalId] : null));
  const closeModal = useStore((s) => s.closeModal);
  const solve = useStore((s) => s.solve);

  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "err" | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const enigma = modalId ? ENIGMAS.find((e) => e.id === modalId) : null;
  const isOpen = !!enigma;
  const isSolved = state?.solved ?? false;

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setFeedback(isSolved ? "ok" : null);
      setFeedbackMsg(isSolved ? "✦ Sort déjà accompli !" : "");
      if (!isSolved) setTimeout(() => inputRef.current?.focus(), 420);
    }
  }, [isOpen, modalId, isSolved]);

  function submit() {
    if (!enigma || !modalId || isSolved) return;

    if (normalize(value) === normalize(enigma.answer)) {
      setFeedback("ok");
      setFeedbackMsg("✦ Sort invoqué avec succès !");
      sndOk();
      solve(modalId);
      fireEvent(enigma.haEvent);

      const el = document.querySelector(`[data-card-id="${modalId}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 35, "#4ecca3");
      }

      setTimeout(() => {
        closeModal();
        const card = document.querySelector(`[data-card-id="${modalId}"]`);
        if (card) {
          card.classList.add("animate-solved-glow");
          card.addEventListener(
            "animationend",
            () => card.classList.remove("animate-solved-glow"),
            { once: true },
          );
        }
      }, 1300);
    } else {
      setFeedback("err");
      setFeedbackMsg("Ce n'est pas la bonne incantation…");
      sndBad();
      setShaking(true);
      setTimeout(() => {
        setFeedback(null);
        setFeedbackMsg("");
        setShaking(false);
      }, 2200);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) closeModal();
  }

  const inputBorder =
    feedback === "ok"
      ? "border-success shadow-[0_0_14px_#4ecca328]"
      : feedback === "err"
        ? "border-danger shadow-[0_0_14px_#ff6b8a28]"
        : "border-[#3a2a5a] focus:border-accent focus:shadow-[0_0_14px_#9b6dff28]";

  return (
    <div
      className={`fixed inset-0 z-100 bg-black/82 backdrop-blur-[5px] flex items-end transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full max-w-[430px] mx-auto rounded-t-3xl border border-[#3a2a5a] border-b-0 px-[22px] pt-7 pb-11 relative overflow-hidden transition-transform duration-400 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        } ${shaking ? "animate-[shake_0.42s_ease]" : ""}`}
        style={{
          background: "linear-gradient(180deg, #1c1438, #100d20)",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Drag handle */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[38px] h-[3.5px] bg-[#3a2a5a] rounded-sm" />

        {/* Close button */}
        <button
          onClick={() => { sndClick(); closeModal(); }}
          className="absolute top-[18px] right-4 w-[30px] h-[30px] bg-white/4 border border-[#3a2a5a] rounded-full flex items-center justify-center cursor-pointer text-muted text-[0.8rem]"
        >
          ✕
        </button>

        {enigma && (
          <>
            <div className="text-[2.8rem] text-center mb-1.5 drop-shadow-[0_0_14px_rgba(155,109,255,0.5)]">
              {enigma.icon}
            </div>
            <h2 className="font-[var(--font-cinzel-decorative)] text-[1.05rem] text-gold text-center mb-5 drop-shadow-[0_0_20px_#e8c96a35]">
              {enigma.title}
            </h2>
            <p className="text-[0.88rem] leading-relaxed text-text text-center mb-5 p-4 bg-white/[0.03] rounded-[14px] border border-[#2e2248] italic">
              {enigma.question}
            </p>

            <input
              ref={inputRef}
              type="text"
              placeholder="Votre réponse…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={isSolved}
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

            <button
              onClick={submit}
              disabled={isSolved}
              className={`w-full mt-3 py-4 border-none rounded-[14px] text-white font-[var(--font-cinzel)] text-[0.85rem] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.97] ${
                isSolved
                  ? "bg-gradient-to-br from-[#2a6a4a] to-success shadow-[0_4px_22px_#4ecca328]"
                  : "bg-gradient-to-br from-[#6b4a97] to-accent shadow-[0_4px_22px_#9b6dff28]"
              }`}
            >
              {isSolved ? "✦ Sort Accompli ✦" : "Invoquer le Sort ✦"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
