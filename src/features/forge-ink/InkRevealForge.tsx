import { useState, useEffect, useCallback, useRef } from "react";
import { INK_CONFIG, buildLetterMap, getWordCells } from "./ink-config";
import { useStore } from "../../store";
import { useAdmin } from "../../useAdmin";
import { spawnParticles } from "../../particles";
import { useCountdown } from "../../hooks/useCountdown";
import {
  sndInkDrop,
  sndInkHit,
  sndInkMiss,
  sndInkMissAdjacent,
  sndInkWordSolved,
  sndInkGuessError,
  sndScrambleSolved,
} from "../../audio";
import type { ForgeProps } from "../../types/forge";

// ── Derived constants ─────────────────────────────────────────────────────
const LETTER_MAP = buildLetterMap(INK_CONFIG);

/** Pré-calcul chaud/froid : distance de chaque case vide à la lettre la plus proche */
function computeProximityMap(): Map<string, "hot" | "warm"> {
  const map = new Map<string, "hot" | "warm">();
  for (let r = 0; r < INK_CONFIG.gridRows; r++) {
    for (let c = 0; c < INK_CONFIG.gridCols; c++) {
      const key = `${r},${c}`;
      if (LETTER_MAP.has(key)) continue;
      let minDist = Infinity;
      for (const lk of LETTER_MAP.keys()) {
        const [lr, lc] = lk.split(",").map(Number);
        const dist = Math.abs(r - lr) + Math.abs(c - lc);
        if (dist < minDist) minDist = dist;
      }
      if (minDist === 1) map.set(key, "hot");
      else if (minDist === 2) map.set(key, "warm");
    }
  }
  return map;
}
const PROXIMITY_MAP = computeProximityMap();

function initWordStates(): Record<string, { solved: boolean; guessesLeft: number }> {
  const states: Record<string, { solved: boolean; guessesLeft: number }> = {};
  for (const word of INK_CONFIG.words) {
    states[word.text] = { solved: false, guessesLeft: INK_CONFIG.maxGuessesPerWord };
  }
  return states;
}

function getWordPattern(wordText: string, revealedCells: Set<string>): string[] {
  const word = INK_CONFIG.words.find((w) => w.text === wordText)!;
  return word.text.split("").map((letter, i) => {
    const row = word.direction === "H" ? word.start[0] : word.start[0] + i;
    const col = word.direction === "H" ? word.start[1] + i : word.start[1];
    return revealedCells.has(`${row},${col}`) ? letter : "_";
  });
}

function getActiveWordTexts(revealedCells: Set<string>): string[] {
  return INK_CONFIG.words
    .filter((word) =>
      getWordCells(word).some(([r, c]) => revealedCells.has(`${r},${c}`)),
    )
    .map((w) => w.text);
}

/** Strip diacritics: "écran" → "ecran", "résonance" → "resonance" */
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Component ─────────────────────────────────────────────────────────────
export function InkRevealForge({ solved: propSolved, onSolve }: ForgeProps) {
  const isAdmin = useAdmin();
  const storedGame = useStore((s) => s.inkGameState);
  const setInkGameState = useStore((s) => s.setInkGameState);
  const countdown = useCountdown();

  // ── Reset quotidien — si le jour stocké ≠ aujourd'hui, on repart à zéro ──
  const isStale = storedGame != null && storedGame.dayStamp !== todayStamp();
  const freshGame = isStale ? null : storedGame;

  // ── Persisted game state ──
  const [revealedCells, setRevealedCells] = useState<Set<string>>(
    () => new Set(freshGame?.revealedCells ?? []),
  );
  const [wordStates, setWordStates] = useState<
    Record<string, { solved: boolean; guessesLeft: number }>
  >(() => freshGame?.wordStates ?? initWordStates());
  const [dropsLeft, setDropsLeft] = useState(
    () => freshGame?.dropsLeft ?? INK_CONFIG.maxDrops,
  );

  // ── Persisted game state (continued) ──
  const [missedCells, setMissedCells] = useState<Set<string>>(
    () => new Set(freshGame?.missedCells ?? []),
  );

  // ── Ephemeral state ──
  const [animatingMissCells, setAnimatingMissCells] = useState<Set<string>>(new Set());
  const [proximityCenter, setProximityCenter] = useState<string | null>(null);
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [animating, setAnimating] = useState<{
    key: string;
    result: "hit" | "miss";
  } | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, boolean>>({});
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [localSolved, setLocalSolved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newlyRevealedCells, setNewlyRevealedCells] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const prevPropSolvedRef = useRef(propSolved);
  const lastTapRef = useRef(0);

  const solved = propSolved || localSolved;

  // Sync persisted state to store
  useEffect(() => {
    setInkGameState({
      revealedCells: Array.from(revealedCells),
      missedCells: Array.from(missedCells),
      wordStates,
      dropsLeft,
      firstDropUsed: false,
      dayStamp: todayStamp(),
    });
  }, [revealedCells, missedCells, wordStates, dropsLeft, setInkGameState]);

  // Admin re-lock detection (propSolved transitioned from true → false)
  useEffect(() => {
    if (!propSolved && prevPropSolvedRef.current) {
      setLocalSolved(false);
      setShowSolvedModal(false);
      setRevealedCells(new Set());
      setWordStates(initWordStates());
      setDropsLeft(INK_CONFIG.maxDrops);
      setMissedCells(new Set());
      setAnimatingMissCells(new Set());
      setProximityCenter(null);
      setInputValues({});
      setInputErrors({});
    }
    prevPropSolvedRef.current = propSolved;
  }, [propSolved]);

  const showMessage = useCallback((msg: string) => {
    setTapMessage(msg);
    setTimeout(() => setTapMessage(null), 3000);
  }, []);

  // Victory check
  useEffect(() => {
    if (solved) return;
    const allWordsSolved = INK_CONFIG.words.every((w) => wordStates[w.text]?.solved);
    if (allWordsSolved) {
      setLocalSolved(true);
      // Celebration particles on all revealed cells
      setTimeout(() => {
        if (gridRef.current) {
          for (const key of LETTER_MAP.keys()) {
            const el = gridRef.current.querySelector<HTMLElement>(`[data-cell="${key}"]`);
            if (el) {
              const rect = el.getBoundingClientRect();
              spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, "#e8c96a");
            }
          }
        }
        sndScrambleSolved();
        navigator.vibrate?.([50, 30, 50, 30, 100]);

        // Shimmer wave diagonal sur toute la grille
        if (gridRef.current) {
          const cells = gridRef.current.querySelectorAll<HTMLElement>("[data-cell]");
          cells.forEach((el) => {
            const [r, c] = (el.dataset.cell ?? "0,0").split(",").map(Number);
            const delay = (r + c) * 50;
            setTimeout(() => {
              el.style.animation = "ink-victory-shimmer 0.6s ease-out both";
              setTimeout(() => { el.style.animation = ""; }, 700);
            }, delay);
          });
        }

        setTimeout(() => setShowSolvedModal(true), 800);
      }, 300);
    }
  }, [wordStates, solved]);

  // Reset clément check
  useEffect(() => {
    if (solved || dropsLeft > 0 || isResetting) return;
    const allLocked = INK_CONFIG.words.every(
      (w) => wordStates[w.text]?.solved || wordStates[w.text]?.guessesLeft === 0,
    );
    if (allLocked) {
      setIsResetting(true);
      showMessage(
        "L'encre s'est tarie… mais les mots déjà révélés ne s'effaceront pas. Le grimoire te laissera réessayer.",
      );
      setTimeout(() => {
        setDropsLeft(INK_CONFIG.maxDrops);
        setAnimatingMissCells(new Set());
        setProximityCenter(null);
        setWordStates((prev) => {
          const next = { ...prev };
          for (const word of INK_CONFIG.words) {
            if (!next[word.text].solved) {
              next[word.text] = {
                ...next[word.text],
                guessesLeft: INK_CONFIG.maxGuessesPerWord,
              };
            }
          }
          return next;
        });
        setIsResetting(false);
      }, 3500);
    }
  }, [dropsLeft, wordStates, solved, isResetting, showMessage]);

  // ── Cell tap handler ──────────────────────────────────────────────────
  const handleCellTap = useCallback(
    (row: number, col: number) => {
      const now = Date.now();
      if (now - lastTapRef.current < 500) return;
      lastTapRef.current = now;

      const key = `${row},${col}`;
      if (
        revealedCells.has(key) ||
        missedCells.has(key) ||
        animating !== null ||
        dropsLeft <= 0
      )
        return;

      const letterEntry = LETTER_MAP.get(key);
      const result: "hit" | "miss" = letterEntry ? "hit" : "miss";

      if (result === "hit") {
        sndInkDrop(dropsLeft / INK_CONFIG.maxDrops);
        navigator.vibrate?.(30);
      } else {
        const isHot = PROXIMITY_MAP.get(key) === "hot";
        if (isHot) sndInkMissAdjacent(); else sndInkMiss();
        navigator.vibrate?.([15, 10, 15]);
        setProximityCenter(key);
        setTimeout(() => setProximityCenter(null), 2800);
      }

      setDropsLeft((prev) => Math.max(0, prev - 1));
      setAnimating({ key, result });

      setTimeout(() => {
        setAnimating(null);

        if (result === "hit") {
          sndInkHit();
          const newRevealed = new Set([...revealedCells, key]);
          setRevealedCells(newRevealed);
          setNewlyRevealedCells((prev) => new Set([...prev, key]));
          setTimeout(() => {
            setNewlyRevealedCells((prev) => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          }, 1100);

          if (gridRef.current) {
            const el = gridRef.current.querySelector<HTMLElement>(`[data-cell="${key}"]`);
            if (el) {
              const rect = el.getBoundingClientRect();
              spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 15, "#e8c96a");
            }
          }

          // Auto-valider les mots dont toutes les cases sont maintenant révélées
          const autoSolved = INK_CONFIG.words.filter((word) => {
            if (wordStates[word.text]?.solved) return false;
            return getWordCells(word).every(([r, c]) => newRevealed.has(`${r},${c}`));
          });
          if (autoSolved.length > 0) {
            setWordStates((prev) => {
              const next = { ...prev };
              for (const word of autoSolved) {
                next[word.text] = { ...next[word.text], solved: true };
              }
              return next;
            });
            autoSolved.forEach((word) => {
              sndInkWordSolved();
              navigator.vibrate?.([30, 20, 50]);
              const cells = getWordCells(word);
              cells.forEach(([r, c], idx) => {
                setTimeout(() => {
                  const el = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${r},${c}"]`);
                  if (el) {
                    el.style.animation = "ink-word-ripple 0.5s ease-out both";
                    setTimeout(() => { el.style.animation = ""; }, 600);
                    const rect = el.getBoundingClientRect();
                    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, "#e8c96a");
                  }
                }, idx * 60);
              });
            });
          }
        } else {
          setMissedCells((prev) => new Set([...prev, key]));
          setAnimatingMissCells((prev) => new Set([...prev, key]));
          setTimeout(() => {
            setAnimatingMissCells((prev) => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            });
          }, 1500);
        }
      }, 420);
    },
    [revealedCells, missedCells, animating, dropsLeft, wordStates, showMessage],
  );

  // ── Word guess handler ────────────────────────────────────────────────
  const handleWordGuess = useCallback(
    (wordText: string) => {
      const val = normalize((inputValues[wordText] ?? "").trim().toUpperCase());
      const state = wordStates[wordText];
      if (!val || !state || state.guessesLeft === 0 || state.solved) return;

      if (val === normalize(wordText)) {
        sndInkWordSolved();
        navigator.vibrate?.([30, 20, 50]);
        const word = INK_CONFIG.words.find((w) => w.text === wordText)!;
        const cells = getWordCells(word);

        setRevealedCells((prev) => {
          const next = new Set(prev);
          cells.forEach(([r, c]) => next.add(`${r},${c}`));
          return next;
        });
        setWordStates((prev) => ({
          ...prev,
          [wordText]: { ...prev[wordText], solved: true },
        }));
        setInputValues((prev) => ({ ...prev, [wordText]: "" }));
        setInputErrors((prev) => ({ ...prev, [wordText]: false }));

        // Cascade particles + ripple
        if (gridRef.current) {
          cells.forEach(([r, c], idx) => {
            setTimeout(() => {
              const el = gridRef.current?.querySelector<HTMLElement>(
                `[data-cell="${r},${c}"]`,
              );
              if (el) {
                el.style.animation = "ink-word-ripple 0.5s ease-out both";
                setTimeout(() => { el.style.animation = ""; }, 600);
                const rect = el.getBoundingClientRect();
                spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, "#e8c96a");
              }
            }, idx * 60);
          });
        }
      } else {
        sndInkGuessError();
        setInputErrors((prev) => ({ ...prev, [wordText]: true }));
        setTimeout(
          () => setInputErrors((prev) => ({ ...prev, [wordText]: false })),
          4000,
        );
        setWordStates((prev) => ({
          ...prev,
          [wordText]: {
            ...prev[wordText],
            guessesLeft: Math.max(0, prev[wordText].guessesLeft - 1),
          },
        }));
        setInputValues((prev) => ({ ...prev, [wordText]: "" }));
      }
    },
    [inputValues, wordStates, showMessage],
  );

  const activeWords = getActiveWordTexts(revealedCells);

  // ── Render ────────────────────────────────────────────────────────────

  // Vue read-only quand la forge est terminée
  if (propSolved && !showSolvedModal) {
    return (
      <div className="mt-4">
        <div
          className="grid gap-[2px] mx-auto"
          style={{
            gridTemplateColumns: `repeat(${INK_CONFIG.gridCols}, 1fr)`,
            maxWidth: "min(100%, 280px)",
          }}
        >
          {Array.from({ length: INK_CONFIG.gridCols * INK_CONFIG.gridRows }, (_, idx) => {
            const row = Math.floor(idx / INK_CONFIG.gridCols);
            const col = idx % INK_CONFIG.gridCols;
            const entry = LETTER_MAP.get(`${row},${col}`);
            return (
              <div
                key={idx}
                className="flex items-center justify-center aspect-square rounded-[3px]"
                style={{
                  background: entry ? "linear-gradient(135deg, #1c1a0a, #0f0e07)" : "transparent",
                  border: entry ? "1px solid rgba(232,201,106,0.3)" : "none",
                  boxShadow: entry ? "0 0 6px #e8c96a15" : "none",
                }}
              >
                {entry && (
                  <span
                    className="text-gold leading-none"
                    style={{
                      fontSize: "0.55rem",
                      fontFamily: "var(--font-cinzel)",
                      fontWeight: 700,
                      textShadow: "0 0 8px #e8c96a60",
                      animation: "gold-letter-shimmer 2.5s ease-in-out infinite",
                      animationDelay: `${(row + col) * 0.12}s`,
                    }}
                  >
                    {entry.letter}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Drops indicator */}
      <div className="text-center text-[0.4rem] tracking-[0.2em] text-muted/30 uppercase mb-2">
        Gouttes restantes
      </div>
      <div className="flex justify-center gap-3 mb-5">
        {Array.from({ length: INK_CONFIG.maxDrops }, (_, i) => (
          <div
            key={i}
            className={`relative overflow-hidden transition-all duration-500 ${
              i < dropsLeft ? (dropsLeft === 1 ? "ink-drop-last" : "ink-drop-active") : ""
            }`}
            style={{
              width: 16,
              height: 23,
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              background:
                i < dropsLeft
                  ? "linear-gradient(160deg, #caaeff 0%, #9b6dff 45%, #6e38cc 100%)"
                  : "linear-gradient(160deg, #1a1230, #0e0b1c)",
            }}
          >
            {i < dropsLeft && (
              <span
                className="absolute rounded-full"
                style={{
                  width: "32%",
                  height: "18%",
                  top: "16%",
                  left: "22%",
                  background: "rgba(255,255,255,0.3)",
                  transform: "rotate(-30deg)",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Timer reset quotidien */}
      {countdown && (
        <div className="text-center text-[0.45rem] tracking-[0.15em] text-muted/30 font-mono mb-4">
          Reset dans {countdown}
        </div>
      )}

      {/* Message flash */}
      {tapMessage && (
        <div
          key={tapMessage}
          className="text-center text-[0.55rem] text-gold/80 italic tracking-wide mb-3 px-4"
          style={{ animation: "forge-unblur 0.3s ease-out both" }}
        >
          {tapMessage}
        </div>
      )}

      {/* Hint premier clic */}
      {revealedCells.size === 0 && missedCells.size === 0 && !solved && (
        <div className="text-center text-[0.45rem] text-muted/40 italic tracking-wide mb-3">
          Touche une case pour y verser de l'encre
        </div>
      )}

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid gap-[3px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${INK_CONFIG.gridCols}, 1fr)`,
          maxWidth: "min(100%, 358px)",
          touchAction: "manipulation",
        }}
      >
        {Array.from({ length: INK_CONFIG.gridCols * INK_CONFIG.gridRows }, (_, idx) => {
          const row = Math.floor(idx / INK_CONFIG.gridCols);
          const col = idx % INK_CONFIG.gridCols;
          const key = `${row},${col}`;
          const letterEntry = LETTER_MAP.get(key);
          const isRevealed = revealedCells.has(key);
          const isMissed = missedCells.has(key);
          const isAnimating = animating?.key === key;
          const isAnimatingHit = animating?.key === key && animating.result === "hit";
          const wordSolved = isRevealed && letterEntry?.wordTexts.some(
            (wt) => wordStates[wt]?.solved,
          );
          const isNewlyRevealed = newlyRevealedCells.has(key);
          const isAnimatingMiss = animatingMissCells.has(key);
          // Case lettre non-révélée directement adjacente au dernier miss
          const isHotLetter = !!letterEntry && !isRevealed && !!proximityCenter && (() => {
            const [cr, cc] = proximityCenter.split(",").map(Number);
            return (Math.abs(row - cr) === 1 && col === cc) ||
                   (row === cr && Math.abs(col - cc) === 1);
          })();
          const proximity = (() => {
            if (!proximityCenter || isRevealed || isMissed || isAnimating) return undefined;
            const [cr, cc] = proximityCenter.split(",").map(Number);
            const isAdjacentToMiss =
              (Math.abs(row - cr) === 1 && col === cc) ||
              (row === cr && Math.abs(col - cc) === 1);
            return isAdjacentToMiss ? PROXIMITY_MAP.get(key) : undefined;
          })();

          return (
            <button
              key={key}
              data-cell={key}
              onPointerDown={(e) => {
                e.preventDefault();
                if (!solved) handleCellTap(row, col);
              }}
              className={[
                "relative flex items-center justify-center",
                "aspect-square min-h-[44px] rounded-[5px]",
                "text-xs font-cinzel font-bold",
                "select-none touch-none outline-none",
                "transition-all duration-300",
                isRevealed
                  ? wordSolved
                    ? "border border-gold/50 shadow-[0_0_10px_#e8c96a25]"
                    : `border border-gold/25 ${isNewlyRevealed ? "ink-cell-revealing" : ""}`
                  : isAnimating
                  ? "border border-accent/50"
                  : isMissed
                  ? "border border-muted/20"
                  : proximity === "hot"
                  ? "ink-proximity-hot border"
                  : proximity === "warm"
                  ? "ink-proximity-warm border"
                  : "border border-locked-border/50 active:border-accent/40 active:scale-[0.93]",
              ].join(" ")}
              style={{
                background: isRevealed
                  ? wordSolved
                    ? "linear-gradient(135deg, #1c1a0a, #0f0e07)"
                    : "linear-gradient(135deg, #181508, #0c0b05)"
                  : isAnimating
                  ? "linear-gradient(135deg, #1a1030, #0d0920)"
                  : isMissed
                  ? "linear-gradient(135deg, #0d0a1a, #07060f)"
                  : proximity === "hot"
                  ? "linear-gradient(135deg, #1e1400, #130e00)"
                  : proximity === "warm"
                  ? "linear-gradient(135deg, #171200, #0e0c00)"
                  : "linear-gradient(135deg, #130f26, #0b0917)",
                boxShadow: undefined,
              }}
            >
              {/* Revealed letter */}
              {isRevealed && letterEntry && (
                <span
                  className="text-gold leading-none z-10"
                  style={{
                    textShadow: wordSolved
                      ? "0 0 12px #e8c96a90"
                      : "0 0 6px #e8c96a50",
                    fontSize: "0.7rem",
                    animation: isNewlyRevealed
                      ? "ink-letter-crystallize 0.85s ease-out both"
                      : wordSolved
                      ? "gold-letter-shimmer 2.5s ease-in-out infinite"
                      : undefined,
                  }}
                >
                  {letterEntry.letter}
                </span>
              )}

              {/* Scintillement — case lettre directement adjacente au miss */}
              {isHotLetter && (
                <span
                  key={proximityCenter}
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4px] z-[8]"
                >
                  {/* Sweep ambré diagonal */}
                  <span
                    className="absolute"
                    style={{
                      width: "55%",
                      height: "130%",
                      top: "-15%",
                      left: 0,
                      background:
                        "linear-gradient(90deg, transparent, #f59e0b90, #fde68a55, transparent)",
                      animation: "proximity-sparkle-sweep 0.65s ease-out 0.08s both",
                    }}
                  />
                  {/* Flash central */}
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle, #f59e0b30 0%, transparent 65%)",
                      animation: "proximity-sparkle-flash 0.45s ease-out both",
                    }}
                  />
                  {/* Point scintillant haut-gauche */}
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 3,
                      height: 3,
                      top: "22%",
                      left: "28%",
                      background: "#fde68a",
                      boxShadow: "0 0 4px #f59e0b",
                      animation: "proximity-sparkle-dot 0.6s ease-out 0.1s both",
                    }}
                  />
                  {/* Point scintillant bas-droite */}
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 2,
                      height: 2,
                      bottom: "25%",
                      right: "30%",
                      background: "#fde68a",
                      boxShadow: "0 0 3px #f59e0b",
                      animation: "proximity-sparkle-dot 0.55s ease-out 0.18s both",
                    }}
                  />
                </span>
              )}

              {/* Drop animation */}
              {isAnimating && (
                <span
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                  style={{ animation: "ink-drop-fall 0.42s ease-in both" }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 10,
                      background: "radial-gradient(circle, #c4a3ff, #9b6dff)",
                      borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
                      boxShadow: "0 0 6px #9b6dff80",
                    }}
                  />
                </span>
              )}

              {/* Hit ripple — ink bleed organique multi-blob */}
              {isAnimatingHit && (
                <span className="absolute inset-0 pointer-events-none z-[15]">
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ animation: "ink-spread-ripple 0.42s ease-out both" }}
                  >
                    <span className="rounded-full" style={{ width: "88%", height: "88%", background: "radial-gradient(circle, #e8c96a42 0%, #9b6dff22 55%, transparent 82%)" }} />
                  </span>
                  <span
                    className="absolute rounded-full"
                    style={{ width: "70%", height: "65%", top: "12%", left: "18%", background: "radial-gradient(ellipse, #e8c96a30 0%, transparent 70%)", animation: "ink-bleed-a 0.5s ease-out both" }}
                  />
                  <span
                    className="absolute rounded-full"
                    style={{ width: "55%", height: "72%", top: "22%", left: "8%", background: "radial-gradient(ellipse, #9b6dff25 0%, transparent 65%)", animation: "ink-bleed-b 0.48s ease-out 0.03s both" }}
                  />
                  <span
                    className="absolute rounded-full"
                    style={{ width: "60%", height: "58%", top: "6%", left: "28%", background: "radial-gradient(ellipse, #e8c96a20 0%, transparent 68%)", animation: "ink-bleed-c 0.52s ease-out 0.05s both" }}
                  />
                </span>
              )}

              {/* Miss — splash animé (éphémère) */}
              {isAnimatingMiss && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-[12]">
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: "66%",
                      height: "66%",
                      background:
                        "radial-gradient(ellipse, #1a1240 0%, #0d0920 55%, transparent 82%)",
                      animation: "ink-miss-splash 1.5s ease-out both",
                    }}
                  />
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: "40%",
                      height: "44%",
                      top: "12%",
                      left: "16%",
                      background:
                        "radial-gradient(ellipse, #130f26 0%, #09071a 68%, transparent)",
                      animation: "ink-miss-blob 1.5s ease-out 0.06s both",
                    }}
                  />
                </span>
              )}

              {/* Miss — tache d'encre séchée (permanente) */}
              {isMissed && !isAnimatingMiss && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: "42%",
                      height: "42%",
                      background:
                        "radial-gradient(ellipse, #16122a 0%, #0d0920 65%, transparent 90%)",
                      opacity: 0.6,
                    }}
                  />
                  <span
                    className="absolute text-muted/18 z-10"
                    style={{ fontSize: "0.32rem" }}
                  >
                    ✕
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Words section */}
      {activeWords.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          <div className="text-center text-[0.45rem] tracking-[0.25em] text-muted/40 uppercase">
            — Mots à révéler —
          </div>

          {activeWords.map((wordText) => {
            const state = wordStates[wordText];
            if (!state) return null;
            const pattern = getWordPattern(wordText, revealedCells);
            const wordDir = INK_CONFIG.words.find((w) => w.text === wordText)?.direction;
            const isLocked = state.guessesLeft === 0 && !state.solved;
            const hasError = inputErrors[wordText];

            return (
              <div
                key={wordText}
                className="rounded-xl border px-3 py-2.5 transition-all duration-300"
                style={{
                  borderColor: state.solved
                    ? "rgba(78,204,163,0.25)"
                    : isLocked
                    ? "rgba(34,26,53,0.4)"
                    : hasError
                    ? "rgba(255,107,138,0.4)"
                    : "rgba(34,26,53,0.6)",
                  background: state.solved
                    ? "linear-gradient(155deg, #0d1a1a, #0a100e)"
                    : isLocked
                    ? "linear-gradient(155deg, #0e0b1a, #07060f)"
                    : hasError
                    ? "linear-gradient(155deg, #1a0a0e, #0f070a)"
                    : "linear-gradient(155deg, #130f26, #0b0917)",
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                {/* Pattern + direction + guess indicators */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.5rem] text-muted/30" title={wordDir === "H" ? "horizontal" : "vertical"}>
                      {wordDir === "H" ? "→" : "↓"}
                    </span>
                  <div className="flex gap-1">
                    {pattern.map((ch, i) => (
                      <span
                        key={i}
                        className="flex items-end justify-center pb-0.5"
                        style={{
                          width: 18,
                          height: 24,
                          borderBottom: `1px solid ${
                            ch !== "_" ? "#e8c96a60" : "#5a4f6a30"
                          }`,
                          fontSize: "0.65rem",
                          fontFamily: "var(--font-cinzel)",
                          fontWeight: 700,
                          color: ch !== "_" ? "#e8c96a" : "#3d3450",
                          textShadow: ch !== "_" ? "0 0 6px #e8c96a50" : "none",
                          lineHeight: 1,
                        }}
                      >
                        {ch !== "_" ? ch : ""}
                      </span>
                    ))}
                  </div>
                  </div>

                  {!state.solved && (
                    <div className="flex gap-1 items-center">
                      {Array.from({ length: INK_CONFIG.maxGuessesPerWord }, (_, i) => (
                        <div
                          key={i}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: 6,
                            height: 6,
                            background:
                              i < state.guessesLeft ? "#9b6dff80" : "#221a3560",
                            boxShadow: i < state.guessesLeft ? "0 0 4px #9b6dff40" : "none",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                {!state.solved && !isLocked && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValues[wordText] ?? ""}
                      onChange={(e) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [wordText]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleWordGuess(wordText)}
                      placeholder="Deviner…"
                      maxLength={wordText.length + 2}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-[0.65rem] font-cinzel
                        bg-transparent outline-none
                        placeholder:text-muted/25 text-text tracking-widest uppercase
                        transition-colors duration-200"
                      style={{
                        border: `1px solid ${
                          hasError ? "#ff6b8a50" : "rgba(34,26,53,0.7)"
                        }`,
                      }}
                    />
                    <button
                      onClick={() => handleWordGuess(wordText)}
                      className="px-3 py-1.5 rounded-lg text-[0.6rem] tracking-[0.15em] uppercase
                        transition-all duration-150 active:scale-95"
                      style={{
                        border: "1px solid rgba(155,109,255,0.3)",
                        color: "rgba(155,109,255,0.7)",
                        background: "rgba(155,109,255,0.05)",
                      }}
                    >
                      →
                    </button>
                  </div>
                )}

                {hasError && (
                  <p className="mt-1.5 text-[0.5rem] text-danger/55 italic tracking-wide">
                    L'encre refuse ce mot…
                  </p>
                )}

                {isLocked && (
                  <p className="text-[0.5rem] text-danger/45 italic tracking-wide">
                    L'encre a séché sur ce mot…
                  </p>
                )}

                {state.solved && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-success/60 text-[0.5rem]">✦</span>
                    <p className="text-[0.5rem] text-success/55 italic tracking-wide">
                      Révélé
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin reset */}
      {isAdmin && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => {
              setRevealedCells(new Set());
              setWordStates(initWordStates());
              setDropsLeft(INK_CONFIG.maxDrops);
              setMissedCells(new Set());
              setAnimatingMissCells(new Set());
              setProximityCenter(null);
              setInputValues({});
              setInputErrors({});
              setLocalSolved(false);
              setShowSolvedModal(false);
                      setIsResetting(false);
            }}
            className="px-3 py-1 rounded-md text-[0.55rem] tracking-[0.15em] uppercase
              border border-danger/30 text-danger/50 bg-danger/5
              hover:border-danger/60 hover:text-danger/80 hover:bg-danger/10
              transition-all duration-150 active:scale-95"
          >
            ↺ Reset jeu
          </button>
        </div>
      )}

      {/* Victory modal */}
      {showSolvedModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background: "rgba(7,6,15,0.88)",
            animation: "love-letter-overlay-in 0.3s ease-out both",
          }}
        >
          <div
            className="mx-6 px-7 py-8 rounded-2xl flex flex-col items-center gap-5 text-center"
            style={{
              border: "1px solid rgba(232,201,106,0.35)",
              background: "linear-gradient(155deg, #1a1430, #0d0920)",
              boxShadow:
                "0 0 60px rgba(232,201,106,0.15), 0 0 120px rgba(232,201,106,0.07)",
              animation: "ink-modal-reveal 0.55s ease-out both",
            }}
          >
            {/* Glyphs décoratifs */}
            <div className="text-[0.45rem] tracking-[0.4em] text-gold/40 uppercase">
              ✦ L'Encre Révélatrice ✦
            </div>

            {/* Message principal */}
            <p
              className="text-[0.8rem] text-text/90 leading-loose italic"
              style={{
                fontFamily: "var(--font-cinzel)",
                letterSpacing: "0.05em",
                textShadow: "0 0 20px rgba(232,201,106,0.15)",
              }}
            >
              "maintenant, tu sais ce qu'il te reste à faire..."
            </p>

            {/* Décor lumineux */}
            <div className="flex gap-2 text-gold/25 text-base">
              <span>ᚠ</span>
              <span>ᚢ</span>
              <span>ᚦ</span>
            </div>

            <button
              onClick={() => {
                setShowSolvedModal(false);
                onSolve();
              }}
              className="px-6 py-2.5 rounded-xl text-[0.6rem] tracking-[0.2em] uppercase
                transition-all duration-200 active:scale-95"
              style={{
                border: "1px solid rgba(232,201,106,0.4)",
                color: "rgba(232,201,106,0.85)",
                background: "rgba(232,201,106,0.06)",
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
