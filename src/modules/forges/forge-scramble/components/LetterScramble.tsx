import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { sndLetterSwap, sndScrambleSolved } from "../../../../audio";
import { EnigmaPicker } from "../../../../components/EnigmaPicker";
import type { ForgeProps } from "../../types";
import { SOLUTION, INITIAL_LETTERS, type Letter } from "../config";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeShuffled(): Letter[] {
  let shuffled = shuffle(INITIAL_LETTERS);
  while (shuffled.map((l) => l.char).join("") === SOLUTION) {
    shuffled = shuffle(INITIAL_LETTERS);
  }
  return shuffled;
}

/** Forge : Le Maillon des Égarés — glisser-déposer de lettres pour reconstituer le mot */
export function LetterScramble({ solved, onSolve }: ForgeProps) {
  const [letters, setLetters] = useState<Letter[]>(() =>
    solved ? SOLUTION.split("").map((char, i) => ({ id: i + 1, char })) : makeShuffled(),
  );
  const [localSolved, setLocalSolved] = useState(false);
  const isSolved = solved || localSolved;
  const [showPicker, setShowPicker] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef(letters);
  // eslint-disable-next-line react-hooks/refs
  lettersRef.current = letters;
  const flipSnapshotRef = useRef<Map<number, DOMRect>>(new Map());

  // Réinitialisation quand le store admin re-lock l'épreuve
  useEffect(() => {
    if (!solved && localSolved) {
      setLocalSolved(false);
      setShowPicker(false);
      setLetters(makeShuffled());
    }
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  // FLIP animation
  useLayoutEffect(() => {
    const container = containerRef.current;
    const snapshot = flipSnapshotRef.current;
    if (!container || snapshot.size === 0) return;
    flipSnapshotRef.current = new Map();

    const cards = container.querySelectorAll<HTMLElement>("[data-lid]");
    cards.forEach((el) => {
      const id = Number(el.dataset.lid);
      const prev = snapshot.get(id);
      if (!prev) return;
      const curr = el.getBoundingClientRect();
      const dx = prev.left - curr.left;
      const dy = prev.top - curr.top;
      if (dx === 0 && dy === 0) return;

      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.getBoundingClientRect();
      el.style.transition = "transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.transform = "";

      const cleanup = () => { el.style.transition = ""; el.removeEventListener("transitionend", cleanup); };
      el.addEventListener("transitionend", cleanup);
    });
  }, [letters]);

  const getCardRects = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLElement>("[data-lid]")).map((el) => ({
      idx: Number(el.dataset.lidx),
      rect: el.getBoundingClientRect(),
    }));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, letter: Letter) => {
      if (isSolved) return;
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
          const dist = Math.hypot(ev.clientX - (rect.left + rect.width / 2), ev.clientY - (rect.top + rect.height / 2));
          if (dist < closestDist) { closest = idx; closestDist = dist; }
        }
        setTargetIdx(closestDist < 55 ? closest : null);
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (ghost) ghost.style.display = "none";
        setDraggingId(null);
        setTargetIdx(null);

        const container = containerRef.current;
        if (container) {
          const snapshot = new Map<number, DOMRect>();
          container.querySelectorAll<HTMLElement>("[data-lid]").forEach((el) => {
            snapshot.set(Number(el.dataset.lid), el.getBoundingClientRect());
          });
          flipSnapshotRef.current = snapshot;
        }

        setLetters((prev) => {
          const fromIdx = prev.findIndex((l) => l.id === letter.id);
          const rects = getCardRects();
          if (!ghost) return prev;
          const gx = parseFloat(ghost.style.left);
          const gy = parseFloat(ghost.style.top);
          let closest = -1;
          let closestDist = Infinity;
          for (const { idx, rect } of rects) {
            const dist = Math.hypot(gx - (rect.left + rect.width / 2), gy - (rect.top + rect.height / 2));
            if (dist < closestDist) { closest = idx; closestDist = dist; }
          }
          if (closestDist < 55 && closest !== -1 && closest !== fromIdx) {
            const arr = [...prev];
            const [item] = arr.splice(fromIdx, 1);
            arr.splice(closest, 0, item);
            sndLetterSwap();
            if (arr.map((l) => l.char).join("") === SOLUTION) {
              setLocalSolved(true);
              sndScrambleSolved();
              setShowPicker(true);
            }
            return arr;
          }
          return prev;
        });
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [isSolved, getCardRects],
  );

  return (
    <div className="mt-6">
      <div ref={containerRef} className="flex justify-center gap-1.5">
        {letters.map((l, i) => (
          <div
            key={l.id}
            data-lid={l.id}
            data-lidx={i}
            onPointerDown={(e) => handlePointerDown(e, l)}
            className={`
              w-8 h-10 flex items-center justify-center
              rounded-lg border text-sm font-cinzel font-bold
              select-none touch-none cursor-grab transition-all duration-150
              ${draggingId === l.id ? "opacity-25 scale-90" : ""}
              ${targetIdx === i && draggingId !== l.id ? "border-gold scale-110 shadow-[0_0_12px_#e8c96a40]" : "border-locked-border"}
              ${isSolved ? "border-solved-border/50 shadow-[0_0_22px_#4ecca325] bg-gradient-to-br from-[#0a1f1a] to-[#080f0c]" : "bg-gradient-to-br from-[#130f26] to-[#0b0917]"}
              text-text
            `}
          >
            {l.char}
          </div>
        ))}
      </div>

      {showPicker && (
        <EnigmaPicker onClose={() => { setShowPicker(false); onSolve(); }} />
      )}

      <div
        ref={ghostRef}
        className="fixed z-[1000] w-8 h-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border border-gold text-sm font-cinzel font-bold bg-gradient-to-br from-[#1c1438] to-[#130f26] text-gold pointer-events-none shadow-[0_0_20px_#e8c96a40]"
        style={{ display: "none" }}
      />
    </div>
  );
}
