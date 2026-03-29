import React, { useCallback, useEffect, useRef, useState } from "react";
import { sndGrimoireOpen, sndPageTurn } from "@/audio";

const SLIDE_LIST = [
  {
    icon: "✦",
    title: "Un souffle ancien…",
    text: "Une force t'a choisie, toi et toi seule. Ce grimoire dormait depuis des siècles, attendant que la bonne personne l'éveille. Ses pages renferment des secrets que nul n'a encore percés… jusqu'à aujourd'hui.",
  },
  {
    icon: "🌙",
    title: "Le temps est ton allié",
    text: "Ce grimoire ne se dévoile pas en un instant. Ses mystères se révèlent au fil des jours, comme une marée qui monte lentement. Reviens chaque jour — de nouvelles portes s'ouvriront peut-être…",
  },
  {
    icon: "◉",
    title: "Chaque essai compte",
    text: "Certaines épreuves sont protégées par un sortilège d'épuisement. Les petits cercles lumineux indiquent tes tentatives restantes. À minuit, la magie se régénère et tu pourras réessayer.",
  },
  {
    icon: "🔮",
    title: "Six Mystères Scellés",
    text: "Tout en bas du grimoire, six sceaux attendent d'être brisés. Pour y parvenir, il te faudra résoudre des énigmes ici… mais aussi dans le monde réel. Tous les indices sont déjà cachés quelque part dans la maison. Certaines manipulations sont plus… modernes qu'il n'y paraît.",
  },
  {
    icon: "💜",
    title: "À toi de jouer",
    text: "Ce grimoire a été tissé rien que pour toi. Chaque rune, chaque sort, chaque secret porte ton nom.\n\nJoyeux anniversaire, mon Amour ✦",
  },
] as const;

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;

export function IntroModal({ onClose }: Readonly<{ onClose: () => void }>): React.JSX.Element {
  const [current, setCurrent] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const drag = useRef<{ startX: number; startTime: number; currentX: number } | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setHasEntered(true);
    });
  }, []);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(SLIDE_LIST.length - 1, i));

    setCurrent((prev) => {
      if (prev !== clamped) {
        sndPageTurn();
      }

      return clamped;
    });
  }, []);

  function handleClose(): void {
    sndGrimoireOpen();
    setIsExiting(true);
    setTimeout(onClose, 400);
  }

  // ─── Drag handlers (horizontal swipe) ───

  function onDragStart(clientX: number): void {
    drag.current = { startX: clientX, startTime: Date.now(), currentX: clientX };
    setIsDragging(true);
  }

  function onDragMove(clientX: number): void {
    if (!drag.current) {
      return;
    }
    drag.current.currentX = clientX;
    setDragX(clientX - drag.current.startX);
  }

  function onDragEnd(): void {
    if (!drag.current) {
      return;
    }
    const dx = drag.current.currentX - drag.current.startX;
    const dt = Date.now() - drag.current.startTime;
    const velocity = Math.abs(dx) / Math.max(dt, 1);

    if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (dx < 0 && current < SLIDE_LIST.length - 1) {
        goTo(current + 1);
      } else if (dx > 0 && current > 0) {
        goTo(current - 1);
      }
    }

    drag.current = null;
    setIsDragging(false);
    setDragX(0);
  }

  function handleTouchStart(e: React.TouchEvent): void {
    onDragStart(e.touches[0].clientX);
  }
  function handleTouchMove(e: React.TouchEvent): void {
    onDragMove(e.touches[0].clientX);
  }
  function handleTouchEnd(): void {
    onDragEnd();
  }
  function handleMouseDown(e: React.MouseEvent): void {
    onDragStart(e.clientX);
    // eslint-disable-next-line unicorn/consistent-function-scoping -- must capture fresh onDragMove ref
    const handleMove = (ev: MouseEvent): void => {
      onDragMove(ev.clientX);
    };
    const handleUp = (): void => {
      onDragEnd();
      globalThis.removeEventListener("mousemove", handleMove);
      globalThis.removeEventListener("mouseup", handleUp);
    };
    globalThis.addEventListener("mousemove", handleMove);
    globalThis.addEventListener("mouseup", handleUp);
  }

  const isLast = current === SLIDE_LIST.length - 1;

  // Clamp drag to avoid over-scrolling at edges
  const clampedDragX = (current === 0 && dragX > 0) || (isLast && dragX < 0) ? dragX * 0.2 : dragX;

  const trackOffset = -(current * 100);

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-400 ${
        hasEntered && !isExiting ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="mx-4 flex w-full max-w-[400px] flex-col items-center">
        {/* Slides track */}
        <div
          ref={containerRef}
          className="w-full touch-pan-y overflow-hidden"
          role="presentation"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div
            className={isDragging ? "" : "transition-transform duration-500 ease-out"}
            style={{
              display: "flex",
              width: `${String(SLIDE_LIST.length * 100)}%`,
              transform: `translateX(calc(${String(trackOffset)}% / ${String(SLIDE_LIST.length)} + ${String(clampedDragX)}px))`,
            }}
          >
            {SLIDE_LIST.map((slide, i) => (
              <div key={i} className="flex-shrink-0 px-2" style={{ width: `${String(100 / SLIDE_LIST.length)}%` }}>
                <div className="flex flex-col items-center px-4 py-8 text-center">
                  <span
                    className={`mb-5 block text-[3rem] transition-all duration-500 ${
                      i === current ? "scale-100 opacity-100" : "scale-75 opacity-30"
                    }`}
                    style={{
                      filter: i === current ? "drop-shadow(0 0 16px #9b6dff80)" : "none",
                    }}
                  >
                    {slide.icon}
                  </span>
                  <h2 className="text-gold mb-4 text-[1.1rem] font-[var(--font-cinzel-decorative)] tracking-wide drop-shadow-[0_0_20px_#e8c96a40]">
                    {slide.title}
                  </h2>
                  <p className="text-text/85 max-w-[320px] text-[0.85rem] leading-relaxed whitespace-pre-line">
                    {slide.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="mt-4 mb-6 flex gap-2.5">
          {SLIDE_LIST.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i);
              }}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-accent scale-125 shadow-[0_0_8px_#9b6dff]" : "bg-muted/40"
              }`}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={
            isLast
              ? handleClose
              : () => {
                  goTo(current + 1);
                }
          }
          className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 rounded-full border px-10 py-3.5 text-[0.8rem] font-[var(--font-cinzel)] tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
        >
          {isLast ? "Ouvrir le Grimoire ✦" : "Suivant"}
        </button>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={handleClose}
            className="text-muted/50 mt-3 cursor-pointer border-none bg-transparent text-[0.68rem] tracking-[0.1em] uppercase"
          >
            Passer l'introduction
          </button>
        )}
      </div>
    </div>
  );
}
