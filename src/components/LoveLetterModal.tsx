import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { ENIGMAS } from "../config";
import { sndLoveClose, sndHeartPop } from "../audio";

const CLOSE_MS = 500;
const BURST_COUNT = 40;

function buildBurst(emojis: string[]) {
  const items: { emoji: string; left: number; delay: number; size: number; rot: number; pitch: number }[] = [];
  let cumDelay = 0.15;
  let gap = 0.2;
  for (let i = 0; i < BURST_COUNT; i++) {
    items.push({
      emoji: emojis[i % emojis.length],
      left: 10 + Math.random() * 80,
      delay: cumDelay,
      size: 1.75 + Math.random() * 0.55,
      rot: -20 + Math.random() * 40,
      pitch: -300 + Math.random() * 600,
    });
    cumDelay += gap;
    gap *= 0.97;
  }
  return items;
}

const GOLD_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${5 + (i % 5) * 22}%`,
  top: `${5 + Math.floor(i / 5) * 23}%`,
  size: 2 + (i % 3) * 1.5,
  delay: i * 0.35,
}));

export function LoveLetterModal() {
  const enigmaId = useStore((s) => s.loveLetterEnigmaId);
  const closeLoveLetter = useStore((s) => s.closeLoveLetter);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const closingEnigmaRef = useRef<string | null>(null);
  const popTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const burstRef = useRef(buildBurst(["❤️"]));

  useEffect(() => {
    if (!enigmaId) {
      setEntered(false);
      setShowHearts(false);
      return;
    }
    closingEnigmaRef.current = enigmaId;
    const currentEnigma = ENIGMAS.find((e) => e.id === enigmaId);
    burstRef.current = buildBurst(currentEnigma?.loveLetter.emojis ?? ["❤️"]);
    setClosing(false);
    const raf = requestAnimationFrame(() => setEntered(true));

    // Launch heart burst with staggered pops
    const showTimer = setTimeout(() => setShowHearts(true), 400);
    popTimers.current = burstRef.current.map((h) =>
      setTimeout(() => sndHeartPop(h.pitch), h.delay * 1000 + 400),
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(showTimer);
      popTimers.current.forEach(clearTimeout);
    };
  }, [enigmaId]);

  const displayId = enigmaId ?? (closing ? closingEnigmaRef.current : null);
  const enigma = displayId ? ENIGMAS.find((e) => e.id === displayId) : null;
  const isOpen = !!enigmaId && !closing;

  function handleClose() {
    sndLoveClose();
    setClosing(true);
    setEntered(false);
    setTimeout(() => {
      setClosing(false);
      closeLoveLetter();
    }, CLOSE_MS);
  }

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-opacity duration-500 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #e8c96a18, #00000090)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={handleClose}
    >
      {/* Heart burst */}
      {showHearts && burstRef.current.map((h, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${h.left}%`,
            bottom: "20%",
            fontSize: `${h.size}rem`,
            ["--heart-rot" as string]: `${h.rot}deg`,
            animation: `heart-float-up 3.5s linear ${h.delay}s both`,
          }}
        >
          {h.emoji}
        </div>
      ))}

      {enigma && (
        <div
          className={`relative max-w-[380px] w-full rounded-[22px] overflow-hidden transition-all duration-700 ${
            entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.82] translate-y-5"
          }`}
          style={{
            background: "linear-gradient(165deg, #fdf8ec, #f5e6c8, #ede0c0)",
            border: "1.5px solid #d4a94280",
            boxShadow:
              "0 0 30px #e8c96a50, 0 0 80px #e8c96a30, 0 0 160px #e8c96a18, inset 0 1px 0 #ffffff60",
            animation: "love-glow-shine 4s ease-in-out infinite",
            transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold particles background */}
          {GOLD_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: "radial-gradient(circle, #e8c96a, #c9a032)",
                animation: `love-particle-float 3.2s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}

          {/* Corner decorations */}
          <div className="absolute top-[10px] left-[10px] w-3 h-3 border-t border-l border-[#c9a03260] opacity-60" />
          <div className="absolute bottom-[10px] left-[10px] w-3 h-3 border-b border-l border-[#c9a03260] opacity-60" />
          <div className="absolute bottom-[10px] right-[10px] w-3 h-3 border-b border-r border-[#c9a03260] opacity-60" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-[28px] h-[28px] rounded-full flex items-center justify-center cursor-pointer text-[0.75rem] z-20 border border-[#c9a03230] bg-[#f5e6c8] text-[#8a7040] hover:bg-[#ede0c0] transition-colors"
          >
            ✕
          </button>

          <div className="relative z-10 px-7 pt-8 pb-9">
            {/* Character icon */}
            <div
              className="text-[2.8rem] text-center mb-2 leading-none"
              style={{
                filter: "drop-shadow(0 0 12px #c9a03240)",
              }}
            >
              {enigma.icon}
            </div>

            {/* Title */}
            <h2
              className="text-center text-[1rem] font-semibold mb-1 tracking-[0.06em]"
              style={{
                fontFamily: "var(--font-cinzel-decorative)",
                color: "#8a6a20",
                textShadow: "0 0 20px #e8c96a30",
              }}
            >
              Une lettre pour toi
            </h2>

            <p
              className="text-center text-[0.68rem] tracking-[0.15em] uppercase mb-5"
              style={{ color: "#a08a50" }}
            >
              {enigma.title}
            </p>

            {/* Gold separator */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }}
              />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
            </div>

            {/* Message */}
            <div
              className="text-[0.84rem] leading-[1.75] text-center whitespace-pre-line mb-6"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#4a3a20",
              }}
            >
              {enigma.loveLetter.message}
            </div>

            {/* Gold separator */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }}
              />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
            </div>

            {/* Signature */}
            <p
              className="text-center text-[0.76rem] italic tracking-wide"
              style={{
                fontFamily: "var(--font-cinzel)",
                color: "#8a6a20",
              }}
            >
              — {enigma.loveLetter.signature} —
            </p>
            <p
              className="text-center text-[0.65rem] mt-2 tracking-[0.12em]"
              style={{ color: "#b09a60" }}
            >
              Avec tout mon amour ♡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
