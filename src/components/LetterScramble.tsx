import { useState, useRef, useCallback } from "react";
import { sndClick, sndScrambleSolved } from "../audio";
import { triggerUnlockEffect } from "../unlock";
import { ENIGMAS } from "../config";
import { useStore } from "../store";

/** ── Configuration ── */
const SOLUTION = "HWHRESSKDS";
const EXCLUDED_IDS = new Set(["Y", "F"]);

interface Letter {
  id: number;
  char: string;
}

const INITIAL_LETTERS: Letter[] = [
  { id: 1, char: "S" },
  { id: 2, char: "W" },
  { id: 3, char: "R" },
  { id: 4, char: "H" },
  { id: 5, char: "K" },
  { id: 6, char: "D" },
  { id: 7, char: "E" },
  { id: 8, char: "H" },
  { id: 9, char: "S" },
  { id: 10, char: "S" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function EnigmaPicker({ onPick }: { onPick: (id: string) => void }) {
  const enigmaStates = useStore((s) => s.enigmas);

  const pickable = ENIGMAS.filter(
    (e) =>
      !EXCLUDED_IDS.has(e.id) &&
      !enigmaStates[e.id]?.unlocked &&
      !enigmaStates[e.id]?.solved,
  );

  if (pickable.length === 0) {
    return (
      <div className="mt-4 text-center text-xs text-muted tracking-wide">
        Toutes les énigmes éligibles sont déjà déverrouillées.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="text-[0.6rem] tracking-[0.25em] text-gold uppercase">
        Choisissez une énigme à déverrouiller
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {pickable.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              sndClick();
              onPick(e.id);
            }}
            className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl
              border border-accent/40 bg-gradient-to-br from-[#1c1438] to-[#130f26]
              active:scale-95 transition-all duration-150
              hover:border-accent hover:shadow-[0_0_16px_#9b6dff30]"
          >
            <svg viewBox="0 0 40 120" width="16" height="48" fill="none" className="opacity-70 drop-shadow-[0_0_6px_#e8c96a40]">
              <circle cx="20" cy="16" r="12" stroke="#e8c96a" strokeWidth="3" fill="none" />
              <circle cx="20" cy="16" r="5" stroke="#e8c96a" strokeWidth="2" fill="none" />
              <line x1="20" y1="28" x2="20" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="80" x2="30" y2="80" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="90" x2="28" y2="90" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="100" x2="26" y2="100" stroke="#e8c96a" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-[0.6rem] text-text tracking-wide">
              Énigme {e.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LetterScramble() {
  const scrambleSolved = useStore((s) => s.scrambleSolved);
  const solveScramble = useStore((s) => s.solveScramble);

  const [letters, setLetters] = useState<Letter[]>(() => {
    if (useStore.getState().scrambleSolved) {
      return SOLUTION.split("").map((char, i) => ({ id: i + 1, char }));
    }
    let shuffled = shuffle(INITIAL_LETTERS);
    while (shuffled.map((l) => l.char).join("") === SOLUTION) {
      shuffled = shuffle(INITIAL_LETTERS);
    }
    return shuffled;
  });

  const solved = scrambleSolved;
  const [showPicker, setShowPicker] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef(letters);
  lettersRef.current = letters;

  const getCardRects = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [];
    const cards = container.querySelectorAll<HTMLElement>("[data-lid]");
    return Array.from(cards).map((el) => ({
      idx: Number(el.dataset.lidx),
      rect: el.getBoundingClientRect(),
    }));
  }, []);

  const handlePick = useCallback((id: string) => {
    setShowPicker(false);
    const enigma = ENIGMAS.find((e) => e.id === id);
    if (enigma) {
      setTimeout(() => triggerUnlockEffect(enigma.id, enigma.title), 400);
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, letter: Letter) => {
      if (solved) return;
      e.preventDefault();

      setDraggingId(letter.id);

      const ghost = ghostRef.current;
      if (ghost) {
        ghost.textContent = letter.char;
        ghost.style.display = "flex";
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
      }

      const onMove = (ev: PointerEvent) => {
        if (ghost) {
          ghost.style.left = `${ev.clientX}px`;
          ghost.style.top = `${ev.clientY}px`;
        }

        const rects = getCardRects();
        let closest = -1;
        let closestDist = Infinity;

        for (const { idx, rect } of rects) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
          if (dist < closestDist) {
            closest = idx;
            closestDist = dist;
          }
        }

        setTargetIdx(closestDist < 55 ? closest : null);
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        if (ghost) ghost.style.display = "none";

        setDraggingId(null);
        setTargetIdx(null);

        setLetters((prev) => {
          const fromIdx = prev.findIndex((l) => l.id === letter.id);

          const rects = getCardRects();
          if (ghost) {
            const gx = parseFloat(ghost.style.left);
            const gy = parseFloat(ghost.style.top);
            let closest = -1;
            let closestDist = Infinity;
            for (const { idx, rect } of rects) {
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dist = Math.hypot(gx - cx, gy - cy);
              if (dist < closestDist) {
                closest = idx;
                closestDist = dist;
              }
            }

            if (closestDist < 55 && closest !== -1 && closest !== fromIdx) {
              const arr = [...prev];
              const [item] = arr.splice(fromIdx, 1);
              arr.splice(closest, 0, item);

              sndClick();

              const word = arr.map((l) => l.char).join("");
              if (word === SOLUTION) {
                solveScramble();
                sndScrambleSolved();
                setShowPicker(true);
              }

              return arr;
            }
          }

          return prev;
        });
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [solved, getCardRects, solveScramble],
  );

  return (
    <div className="mt-6">
      <div
        ref={containerRef}
        className="flex justify-center gap-1.5"
      >
        {letters.map((l, i) => (
          <div
            key={l.id}
            data-lid={l.id}
            data-lidx={i}
            onPointerDown={(e) => handlePointerDown(e, l)}
            className={`
              w-8 h-10 flex items-center justify-center
              rounded-lg border text-sm font-cinzel font-bold
              select-none touch-none cursor-grab
              transition-all duration-150
              ${draggingId === l.id ? "opacity-25 scale-90" : ""}
              ${targetIdx === i && draggingId !== l.id ? "border-gold scale-110 shadow-[0_0_12px_#e8c96a40]" : "border-locked-border"}
              ${solved ? "border-success shadow-[0_0_10px_#4ecca330]" : ""}
              bg-gradient-to-br from-[#130f26] to-[#0b0917]
              text-text
            `}
          >
            {l.char}
          </div>
        ))}
      </div>

      {/* Picker — choose which enigma to unlock */}
      {showPicker && <EnigmaPicker onPick={handlePick} />}

      {/* Ghost — follows pointer during drag */}
      <div
        ref={ghostRef}
        className="fixed z-[1000] w-8 h-10 -translate-x-1/2 -translate-y-1/2
          flex items-center justify-center
          rounded-lg border border-gold text-sm font-cinzel font-bold
          bg-gradient-to-br from-[#1c1438] to-[#130f26] text-gold
          pointer-events-none shadow-[0_0_20px_#e8c96a40]"
        style={{ display: "none" }}
      />
    </div>
  );
}
