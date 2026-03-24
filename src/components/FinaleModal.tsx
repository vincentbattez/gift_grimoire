import { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "../store";
import { ENIGMAS } from "../config";
import { sndFinale, sndHeartPop, sndPageTurn, sndGoldenSeal, sndCrackle, sndFireworkLaunch } from "../audio";
import { spawnParticles, spawnCelebration } from "../particles";

const CELEBRATION_DURATION = 9000;
const STAR_COUNT = 35;
const EMOJI_BURST_COUNT = 50;
const ROCKET_RISE_MS = 800;

type Rocket = {
  id: number;
  startX: number; // % from left
  targetX: number; // px from center
  targetY: number; // px from center
  color: string;
  dy: string; // CSS var for travel distance
  duration: number; // rise duration ms
  launchedAt: number; // timestamp
  exploded: boolean;
};

const FINALE_EMOJIS = ["✨", "💛", "🌟", "💫", "⭐", "🦋", "💃", "🖼️", "🎭", "💓", "🌅", "❤️"];

const GOLD_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  left: `${3 + (i % 6) * 16}%`,
  top: `${3 + Math.floor(i / 6) * 24}%`,
  size: 2 + (i % 4) * 1.2,
  delay: i * 0.28,
}));

function buildStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    left: 5 + Math.random() * 90,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2,
    size: 0.8 + Math.random() * 1.2,
    emoji: ["✨", "⭐", "🌟", "💫"][i % 4],
  }));
}

function buildEmojiBurst() {
  const items: { emoji: string; left: number; delay: number; size: number; rot: number; pitch: number }[] = [];
  let cumDelay = 0.1;
  let gap = 0.15;
  for (let i = 0; i < EMOJI_BURST_COUNT; i++) {
    items.push({
      emoji: FINALE_EMOJIS[i % FINALE_EMOJIS.length],
      left: 5 + Math.random() * 90,
      delay: cumDelay,
      size: 1.4 + Math.random() * 0.8,
      rot: -30 + Math.random() * 60,
      pitch: -400 + Math.random() * 800,
    });
    cumDelay += gap;
    gap *= 0.97;
  }
  return items;
}

// ── Slides ──

function SlideContext() {
  return (
    <div className="text-center">
      <div
        className="text-[2.5rem] mb-3 leading-none"
        style={{ filter: "drop-shadow(0 0 14px #c9a03250)" }}
      >
        📜
      </div>
      <h3
        className="text-[0.95rem] font-semibold mb-3 tracking-[0.06em]"
        style={{ fontFamily: "var(--font-cinzel-decorative)", color: "#8a6a20", textShadow: "0 0 20px #e8c96a30" }}
      >
        Fin du Grimoire
      </h3>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }} />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
      </div>

      <p
        className="text-[0.8rem] leading-[1.8] whitespace-pre-line mb-4"
        style={{ fontFamily: "var(--font-cinzel)", color: "#4a3a20" }}
      >
        {`Tu as percé les six mystères,
forgé les trois clés,
et lu chaque lettre que mon cœur
avait cachée pour toi.

Ce grimoire n'était pas un jeu.

C'était ma façon de te dire ce que les mots seuls n'auraient pas suffi à exprimer...`}
      </p>

      <p
        className="text-[0.7rem] italic tracking-wide"
        style={{ fontFamily: "var(--font-cinzel)", color: "#a08a50" }}
      >
        Chaque énigme portait un morceau de ce que tu représentes pour moi.
      </p>
    </div>
  );
}

function SlideStats() {
  const enigmas = useStore((s) => s.enigmas);
  const readLetters = useStore((s) => s.readLetters);
  const solvedCount = Object.values(enigmas).filter((e) => e.solved).length;
  const lettersRead = Object.values(readLetters).filter(Boolean).length;

  const stats = [
    { label: "Mystères percés", value: `${solvedCount}/6`, icon: "🔓" },
    { label: "Lettres d'amour lues", value: `${lettersRead}/6`, icon: "💌" },
    { label: "Clés forgées", value: "3/3", icon: "🗝️" },
    { label: "Personnages Disney", value: "6", icon: "✨" },
  ];

  return (
    <div className="text-center">
      <div
        className="text-[2.5rem] mb-3 leading-none"
        style={{ filter: "drop-shadow(0 0 14px #c9a03250)" }}
      >
        📊
      </div>
      <h3
        className="text-[0.95rem] font-semibold mb-4 tracking-[0.06em]"
        style={{ fontFamily: "var(--font-cinzel-decorative)", color: "#8a6a20", textShadow: "0 0 20px #e8c96a30" }}
      >
        Ton aventure
      </h3>

      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }} />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] py-3 px-2"
            style={{
              background: "linear-gradient(145deg, #f5e6c820, #ede0c010)",
              border: "1px solid #d4a94225",
            }}
          >
            <div className="text-[1.3rem] mb-1">{s.icon}</div>
            <div
              className="text-[1.1rem] font-bold"
              style={{ fontFamily: "var(--font-cinzel-decorative)", color: "#8a6a20" }}
            >
              {s.value}
            </div>
            <div className="text-[0.55rem] tracking-[0.1em] uppercase mt-0.5" style={{ color: "#a08a50" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Character parade */}
      <div className="flex justify-center gap-2 mt-3">
        {ENIGMAS.map((e) => (
          <div
            key={e.id}
            className="text-[1.4rem]"
            style={{ filter: "drop-shadow(0 0 8px #c9a03240)" }}
            title={e.title}
          >
            {e.icon}
          </div>
        ))}
      </div>
      <p className="text-[0.5rem] tracking-[0.15em] uppercase mt-1.5" style={{ color: "#b09a60" }}>
        Les gardiens du grimoire
      </p>
    </div>
  );
}

function SlideLove() {
  return (
    <div className="text-center">
      <div
        className="text-[2.5rem] mb-3 leading-none"
        style={{ filter: "drop-shadow(0 0 14px #c9a03250)" }}
      >
        💛
      </div>
      <h3
        className="text-[0.95rem] font-semibold mb-3 tracking-[0.06em]"
        style={{ fontFamily: "var(--font-cinzel-decorative)", color: "#8a6a20", textShadow: "0 0 20px #e8c96a30" }}
      >
        Mon Léamour
      </h3>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }} />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
      </div>

      <p
        className="text-[0.8rem] leading-[1.85] whitespace-pre-line mb-5"
        style={{ fontFamily: "var(--font-cinzel)", color: "#4a3a20" }}
      >
        {`Chaque ligne de code de ce grimoire
a été écrite en pensant à toi.

Tu es la raison pour laquelle je crois encore à la magie.
Celle qui existe quand tu poses ta tête sur mon épaule et que le monde s'arrête.

Je t'aime au-delà des mots,
au-delà des énigmes,
au-delà de tout ce que
ce grimoire pourra jamais contenir.`}
      </p>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a03240]" />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, #e8c96a, #c9a032)" }} />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a03240]" />
      </div>

      <p
        className="text-[0.76rem] italic tracking-wide"
        style={{ fontFamily: "var(--font-cinzel)", color: "#8a6a20" }}
      >
        — Pour toujours, ton Vincent —
      </p>
      <p className="text-[0.65rem] mt-2 tracking-[0.12em]" style={{ color: "#b09a60" }}>
        Avec tout mon amour, infiniment ♡
      </p>
    </div>
  );
}

const SLIDES = [SlideContext, SlideStats, SlideLove];

// ── Main Component ──

export function FinaleModal() {
  const finaleActive = useStore((s) => s.finaleActive);
  const finaleModalOpen = useStore((s) => s.finaleModalOpen);
  const openFinaleModal = useStore((s) => s.openFinaleModal);
  const closeFinaleModal = useStore((s) => s.closeFinaleModal);

  const [celebrationPhase, setCelebrationPhase] = useState<"idle" | "launching" | "exploding" | "stars" | "converge" | "nova" | "done">("idle");
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const rocketIdRef = useRef(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<"in" | "out">("in");
  const [modalEntered, setModalEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  const starsRef = useRef(buildStars());
  const burstRef = useRef(buildEmojiBurst());
  const popTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const celebTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Launch a rocket from bottom, explode after rise
  const launchRocket = useCallback((
    startXPct: number,
    targetX: number,
    targetY: number,
    color: string,
    riseDuration = ROCKET_RISE_MS,
    intensity = 1,
    useCelebration = true,
  ) => {
    const id = ++rocketIdRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dy = `${-(vh - targetY - 40)}px`; // travel from bottom to target

    const rocket: Rocket = {
      id, startX: startXPct, targetX, targetY, color,
      dy, duration: riseDuration, launchedAt: Date.now(), exploded: false,
    };

    sndFireworkLaunch(0.8 + Math.random() * 0.4);
    setRockets((prev) => [...prev, rocket]);

    // Explode after rise completes
    const explodeTimer = setTimeout(() => {
      if (useCelebration) {
        spawnCelebration(targetX, targetY);
      } else {
        spawnParticles(targetX, targetY, 50, color);
      }
      sndCrackle(intensity);
      navigator.vibrate?.([30 + intensity * 40]);
      setRockets((prev) => prev.map((r) => r.id === id ? { ...r, exploded: true } : r));

      // Cleanup rocket from state after explosion fades
      setTimeout(() => {
        setRockets((prev) => prev.filter((r) => r.id !== id));
      }, 500);
    }, riseDuration * 0.85);

    celebTimers.current.push(explodeTimer);
    return id;
  }, []);

  // Celebration sequence
  useEffect(() => {
    if (!finaleActive || finaleModalOpen) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;
    const cy = vh / 2;

    // Phase 1: First salvo — 3 rockets launched in quick succession
    setCelebrationPhase("launching");
    sndFinale();

    launchRocket(45, cx, cy * 0.6, "#e8c96a", 900, 1, true);
    celebTimers.current.push(
      setTimeout(() => launchRocket(25, cx - 80, cy * 0.5, "#9b6dff", 850, 0.8, true), 400),
      setTimeout(() => launchRocket(70, cx + 80, cy * 0.7, "#4ecca3", 800, 0.9, true), 700),
    );

    // Transition to exploding phase after first rockets land
    celebTimers.current.push(setTimeout(() => {
      setCelebrationPhase("exploding");
      navigator.vibrate?.([50, 30, 50, 30, 100]);
    }, 1000));

    // Phase 2: Second salvo — more rockets, different positions
    celebTimers.current.push(
      setTimeout(() => launchRocket(15, cx - 120, cy * 0.4, "#ff6b8a", 750, 0.7, false), 1800),
      setTimeout(() => launchRocket(80, cx + 100, cy * 0.5, "#e8c96a", 800, 0.8, true), 2100),
      setTimeout(() => launchRocket(50, cx, cy * 0.35, "#9b6dff", 900, 1, true), 2400),
    );

    // Phase 3: Stars rain
    celebTimers.current.push(setTimeout(() => {
      setCelebrationPhase("stars");
      navigator.vibrate?.([30, 50, 30]);
      // Two more rockets during stars
      launchRocket(35, cx - 60, cy * 0.45, "#ff6b8a", 700, 0.6, false);
      launchRocket(65, cx + 60, cy * 0.55, "#4ecca3", 750, 0.6, false);
    }, 3500));

    // Phase 4: Converge
    celebTimers.current.push(setTimeout(() => {
      setCelebrationPhase("converge");
      navigator.vibrate?.(100);
      spawnParticles(cx, cy, 50, "#e8c96a");
      sndCrackle(0.5);
    }, 5500));

    // Phase 5: Grand finale — rapid fire rockets
    celebTimers.current.push(setTimeout(() => {
      const colors = ["#e8c96a", "#9b6dff", "#4ecca3", "#ff6b8a", "#e8c96a"];
      colors.forEach((col, i) => {
        setTimeout(() => {
          const x = 15 + Math.random() * 70;
          const tx = cx + (Math.random() - 0.5) * 200;
          const ty = cy * (0.3 + Math.random() * 0.4);
          launchRocket(x, tx, ty, col, 600 + Math.random() * 200, 0.9, i % 2 === 0);
        }, i * 250);
      });
    }, 6500));

    // Phase 6: Golden nova
    celebTimers.current.push(setTimeout(() => {
      setCelebrationPhase("nova");
      navigator.vibrate?.(200);
      sndGoldenSeal();
      spawnCelebration(cx, cy);
      sndCrackle(1.2);
    }, 8000));

    // Open modal
    celebTimers.current.push(setTimeout(() => {
      setCelebrationPhase("done");
      openFinaleModal();
    }, CELEBRATION_DURATION));

    return () => celebTimers.current.forEach(clearTimeout);
  }, [finaleActive, finaleModalOpen, openFinaleModal, launchRocket]);

  // Modal entrance
  useEffect(() => {
    if (!finaleModalOpen) {
      setModalEntered(false);
      return;
    }
    setSlideIndex(0);
    setSlideDir("in");
    setClosing(false);
    const raf = requestAnimationFrame(() => setModalEntered(true));

    // Heart pops
    popTimers.current = burstRef.current.slice(0, 20).map((h) =>
      setTimeout(() => sndHeartPop(h.pitch), h.delay * 1000 + 500),
    );

    return () => {
      cancelAnimationFrame(raf);
      popTimers.current.forEach(clearTimeout);
    };
  }, [finaleModalOpen]);

  const nextSlide = useCallback(() => {
    if (slideIndex >= SLIDES.length - 1) return;
    sndPageTurn();
    setSlideDir("out");
    setTimeout(() => {
      setSlideIndex((i) => i + 1);
      setSlideDir("in");
    }, 300);
  }, [slideIndex]);

  const prevSlide = useCallback(() => {
    if (slideIndex <= 0) return;
    sndPageTurn();
    setSlideDir("out");
    setTimeout(() => {
      setSlideIndex((i) => i - 1);
      setSlideDir("in");
    }, 300);
  }, [slideIndex]);

  function handleClose() {
    if (slideIndex < SLIDES.length - 1) return; // Can only close on last slide
    sndGoldenSeal();
    setClosing(true);
    setModalEntered(false);
    setTimeout(() => {
      setClosing(false);
      closeFinaleModal();
      setCelebrationPhase("idle");
    }, 600);
  }

  const isModalOpen = finaleModalOpen && !closing;
  const CurrentSlide = SLIDES[slideIndex];

  return (
    <>
      {/* ── Celebration overlay ── */}
      {finaleActive && !finaleModalOpen && (
        <div
          className="fixed inset-0 z-[200] pointer-events-none transition-opacity duration-700"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, #07060fDD, #07060fF8)",
            opacity: celebrationPhase === "done" ? 0 : 1,
          }}
        >
          {/* Rocket projectiles */}
          {rockets.map((r) => (
            <div
              key={r.id}
              className="absolute pointer-events-none"
              style={{
                left: `${r.startX}%`,
                bottom: 0,
                ["--rocket-dy" as string]: r.dy,
                ["--rocket-color" as string]: r.color,
                animation: `finale-rocket-rise ${r.duration}ms ease-out forwards`,
                opacity: r.exploded ? 0 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {/* Rocket head */}
              <div
                className="w-[6px] h-[6px] rounded-full"
                style={{
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}, 0 0 16px ${r.color}`,
                  animation: "finale-rocket-glow 0.15s ease-in-out infinite",
                }}
              />
              {/* Trail */}
              <div
                className="w-[2px] mx-auto"
                style={{
                  background: `linear-gradient(to bottom, ${r.color}CC, ${r.color}40, transparent)`,
                  animation: `finale-rocket-trail ${r.duration}ms ease-out forwards`,
                }}
              />
            </div>
          ))}

          {/* Screen pulse flashes — fade out after stars phase */}
          <div
            className="absolute inset-0 transition-opacity duration-800"
            style={{
              opacity: celebrationPhase === "exploding" || celebrationPhase === "stars" ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at 50% 50%, #e8c96a25, transparent 60%)",
                animation: "finale-screen-pulse 0.8s ease-in-out infinite",
              }}
            />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${["#e8c96a60", "#9b6dff50", "#4ecca350"][i]}, transparent 70%)`,
                  animation: `finale-radial-burst ${1.2 + i * 0.3}s ease-out ${i * 0.5}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Star rain — always rendered once started, fades out naturally via animation `both` */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: celebrationPhase === "stars" || celebrationPhase === "converge" ? 1 : 0,
            }}
          >
            {starsRef.current.map((s, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${s.left}%`,
                  top: 0,
                  fontSize: `${s.size}rem`,
                  animation: `finale-star-fall ${s.duration}s linear ${s.delay}s both`,
                }}
              >
                {s.emoji}
              </div>
            ))}
          </div>

          {/* Emoji burst — appears during stars, persists through converge, fades in nova */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: celebrationPhase === "stars" || celebrationPhase === "converge" ? 1 : 0,
            }}
          >
            {burstRef.current.map((h, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${h.left}%`,
                  bottom: "10%",
                  fontSize: `${h.size}rem`,
                  ["--heart-rot" as string]: `${h.rot}deg`,
                  animation: `heart-float-up 3.5s linear ${h.delay}s both`,
                }}
              >
                {h.emoji}
              </div>
            ))}
          </div>

          {/* Converge orbs — fade in during converge, fade out during nova */}
          <div
            className="absolute inset-0 transition-opacity duration-600"
            style={{
              opacity: celebrationPhase === "converge" ? 1 : 0,
            }}
          >
            {FINALE_EMOJIS.slice(0, 8).map((emoji, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  ["--fx" as string]: `${Math.cos((Math.PI * 2 / 8) * i) * 200}px`,
                  ["--fy" as string]: `${Math.sin((Math.PI * 2 / 8) * i) * 200}px`,
                  fontSize: "1.8rem",
                  animation: `finale-converge 1.5s ease-in ${i * 0.08}s both`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          {/* Golden nova — fades in at nova phase */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{
              opacity: celebrationPhase === "nova" ? 1 : 0,
            }}
          >
            <div
              className="w-32 h-32 rounded-full"
              style={{
                background: "radial-gradient(circle, #e8c96aCC, #e8c96a60, #e8c96a00 70%)",
                animation: celebrationPhase === "nova" ? "finale-golden-nova 1.5s ease-out forwards" : undefined,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {(finaleModalOpen || closing) && (
        <div
          className={`fixed inset-0 z-[210] flex items-center justify-center p-4 transition-opacity duration-600 ${
            isModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #e8c96a22, #07060fF0)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Background hearts */}
          {burstRef.current.slice(0, 25).map((h, i) => (
            <div
              key={i}
              className="absolute pointer-events-none z-10"
              style={{
                left: `${h.left}%`,
                bottom: "15%",
                fontSize: `${h.size * 0.8}rem`,
                ["--heart-rot" as string]: `${h.rot}deg`,
                animation: `heart-float-up 4s linear ${h.delay + 0.5}s both`,
              }}
            >
              {h.emoji}
            </div>
          ))}

          {/* Modal card */}
          <div
            className={`relative max-w-[400px] w-full rounded-[22px] overflow-hidden transition-all duration-800 ${
              modalEntered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.7] translate-y-8"
            }`}
            style={{
              background: "linear-gradient(165deg, #fdf8ec, #f5e6c8, #ede0c0)",
              border: "1.5px solid #d4a94280",
              boxShadow: "0 0 40px #e8c96a60, 0 0 100px #e8c96a30, 0 0 200px #e8c96a15, inset 0 1px 0 #ffffff60",
              animation: modalEntered ? "love-glow-shine 4s ease-in-out infinite" : undefined,
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold particles */}
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
            <div className="absolute top-[10px] right-[10px] w-3 h-3 border-t border-r border-[#c9a03260] opacity-60" />
            <div className="absolute bottom-[10px] left-[10px] w-3 h-3 border-b border-l border-[#c9a03260] opacity-60" />
            <div className="absolute bottom-[10px] right-[10px] w-3 h-3 border-b border-r border-[#c9a03260] opacity-60" />

            {/* Slide content */}
            <div className="relative z-10 px-7 pt-7 pb-6">
              <div
                key={slideIndex}
                style={{
                  animation: slideDir === "in"
                    ? "finale-slide-in 0.4s ease-out both"
                    : "finale-slide-out 0.3s ease-in both",
                }}
              >
                <CurrentSlide />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                {/* Prev */}
                <button
                  onClick={prevSlide}
                  disabled={slideIndex === 0}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[0.7rem] border transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
                  style={{
                    borderColor: "#c9a03240",
                    background: "#f5e6c8",
                    color: "#8a7040",
                  }}
                >
                  ‹
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === slideIndex ? 10 : 6,
                        height: i === slideIndex ? 10 : 6,
                        background: i === slideIndex
                          ? "radial-gradient(circle, #e8c96a, #c9a032)"
                          : "#c9a03240",
                        animation: i === slideIndex ? "finale-dot-active 2s ease-in-out infinite" : undefined,
                      }}
                    />
                  ))}
                </div>

                {/* Next / Close */}
                {slideIndex < SLIDES.length - 1 ? (
                  <button
                    onClick={nextSlide}
                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[0.7rem] border transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: "#c9a03240",
                      background: "#f5e6c8",
                      color: "#8a7040",
                    }}
                  >
                    ›
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 rounded-full text-[0.6rem] tracking-[0.12em] uppercase border transition-all duration-200 cursor-pointer"
                    style={{
                      borderColor: "#c9a03260",
                      background: "linear-gradient(135deg, #f5e6c8, #ede0c0)",
                      color: "#8a6a20",
                      fontFamily: "var(--font-cinzel)",
                    }}
                  >
                    Fermer ♡
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
