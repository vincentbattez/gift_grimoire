import { useState, useEffect, useCallback, useRef } from "react";
import { INK_CONFIG, buildLetterMap, getWordCells } from "./ink-config";
import { useStore } from "../../store";
import { useAdmin } from "../../useAdmin";
import { EnigmaPicker } from "../../components/EnigmaPicker";
import { spawnParticles } from "../../particles";
import {
  sndInkDrop,
  sndInkHit,
  sndInkMiss,
  sndInkWordSolved,
  sndScrambleSolved,
} from "../../audio";
import type { ForgeProps } from "../../types/forge";

// ── Derived constants ─────────────────────────────────────────────────────
const LETTER_MAP = buildLetterMap(INK_CONFIG);

/** Pré-calcul chaud/froid : distance de chaque case vide à la lettre la plus proche */
function computeProximityMap(): Map<string, "hot" | "warm"> {
  const map = new Map<string, "hot" | "warm">();
  for (let r = 0; r < INK_CONFIG.gridSize; r++) {
    for (let c = 0; c < INK_CONFIG.gridSize; c++) {
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

// ── Types ─────────────────────────────────────────────────────────────────
type MissType = "miss";

// ── Component ─────────────────────────────────────────────────────────────
export function InkRevealForge({ solved: propSolved, onSolve }: ForgeProps) {
  const isAdmin = useAdmin();
  const storedGame = useStore((s) => s.inkGameState);
  const setInkGameState = useStore((s) => s.setInkGameState);

  // ── Persisted game state ──
  const [revealedCells, setRevealedCells] = useState<Set<string>>(
    () => new Set(storedGame?.revealedCells ?? []),
  );
  const [wordStates, setWordStates] = useState<
    Record<string, { solved: boolean; guessesLeft: number }>
  >(() => storedGame?.wordStates ?? initWordStates());
  const [dropsLeft, setDropsLeft] = useState(
    () => storedGame?.dropsLeft ?? INK_CONFIG.maxDrops,
  );

  // ── Ephemeral state ──
  const [missedCells, setMissedCells] = useState<Map<string, MissType>>(new Map());
  const [proximityCenter, setProximityCenter] = useState<string | null>(null);
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [animating, setAnimating] = useState<{
    key: string;
    result: "hit" | MissType;
  } | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, boolean>>({});
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [introCollapsed, setIntroCollapsed] = useState(true);
  const [localSolved, setLocalSolved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevPropSolvedRef = useRef(propSolved);

  const solved = propSolved || localSolved;

  // Sync persisted state to store
  useEffect(() => {
    setInkGameState({
      revealedCells: Array.from(revealedCells),
      wordStates,
      dropsLeft,
      firstDropUsed: false,
    });
  }, [revealedCells, wordStates, dropsLeft, setInkGameState]);

  // Admin re-lock detection (propSolved transitioned from true → false)
  useEffect(() => {
    if (!propSolved && prevPropSolvedRef.current) {
      setLocalSolved(false);
      setShowPicker(false);
      setShowSolvedModal(false);
      setRevealedCells(new Set());
      setWordStates(initWordStates());
      setDropsLeft(INK_CONFIG.maxDrops);
      setMissedCells(new Map());
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
        setMissedCells(new Map());
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
        sndInkDrop();
      } else {
        sndInkMiss();
        setProximityCenter(key);
        setTimeout(() => setProximityCenter(null), 2800);
      }

      setDropsLeft((prev) => Math.max(0, prev - 1));
      setAnimating({ key, result });

      setTimeout(() => {
        setAnimating(null);

        if (result === "hit") {
          sndInkHit();
          setRevealedCells((prev) => new Set([...prev, key]));

          if (gridRef.current) {
            const el = gridRef.current.querySelector<HTMLElement>(`[data-cell="${key}"]`);
            if (el) {
              const rect = el.getBoundingClientRect();
              spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 15, "#e8c96a");
            }
          }
        } else {
          setMissedCells((prev) => new Map([...prev, [key, "miss"]]));
          setTimeout(() => {
            setMissedCells((prev) => {
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
          }, 1500);
        }
      }, 420);
    },
    [revealedCells, missedCells, animating, dropsLeft, showMessage],
  );

  // ── Word guess handler ────────────────────────────────────────────────
  const handleWordGuess = useCallback(
    (wordText: string) => {
      const val = (inputValues[wordText] ?? "").trim().toUpperCase();
      const state = wordStates[wordText];
      if (!val || !state || state.guessesLeft === 0 || state.solved) return;

      if (val === wordText) {
        sndInkWordSolved();
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

        // Cascade particles
        if (gridRef.current) {
          cells.forEach(([r, c], idx) => {
            setTimeout(() => {
              const el = gridRef.current?.querySelector<HTMLElement>(
                `[data-cell="${r},${c}"]`,
              );
              if (el) {
                const rect = el.getBoundingClientRect();
                spawnParticles(
                  rect.left + rect.width / 2,
                  rect.top + rect.height / 2,
                  10,
                  "#e8c96a",
                );
              }
            }, idx * 70);
          });
        }
      } else {
        setInputErrors((prev) => ({ ...prev, [wordText]: true }));
        showMessage("L'encre refuse ce mot…");
        setTimeout(
          () => setInputErrors((prev) => ({ ...prev, [wordText]: false })),
          900,
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
  return (
    <div className="mt-4">
      {/* Intro collapsible */}
      <button
        onClick={() => setIntroCollapsed((v) => !v)}
        className="w-full text-left mb-4 px-3 py-2 rounded-lg border border-locked-border/40
          text-[0.5rem] text-muted/50 tracking-wide leading-relaxed
          hover:border-locked-border hover:text-muted/70 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="text-muted/30">{introCollapsed ? "↓" : "↑"}</span>
          <span className="italic">
            {introCollapsed ? "Lire l'introduction…" : "Réduire"}
          </span>
        </span>
        {!introCollapsed && (
          <p className="mt-2 text-[0.5rem] text-muted/45 italic leading-relaxed">
            Cette page du grimoire semble vide… mais tes doigts sentent les sillons
            d'une plume ancienne. Des mots y furent tracés à l'encre des secrets — une
            encre que seul un regard patient peut révéler. Verse tes gouttes avec
            discernement : l'encre révélatrice n'est pas inépuisable.
          </p>
        )}
      </button>

      {/* Drops indicator */}
      <div className="flex justify-center gap-3 mb-5">
        {Array.from({ length: INK_CONFIG.maxDrops }, (_, i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              width: 14,
              height: 20,
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              background:
                i < dropsLeft
                  ? "linear-gradient(160deg, #b08dff, #9b6dff)"
                  : "#221a35",
              boxShadow: i < dropsLeft ? "0 0 8px #9b6dff50" : "none",
            }}
          />
        ))}
      </div>

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

      {/* Grid 7×7 */}
      <div
        ref={gridRef}
        className="grid gap-[3px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${INK_CONFIG.gridSize}, 1fr)`,
          maxWidth: "min(100%, 358px)",
          touchAction: "manipulation",
        }}
      >
        {Array.from({ length: INK_CONFIG.gridSize * INK_CONFIG.gridSize }, (_, idx) => {
          const row = Math.floor(idx / INK_CONFIG.gridSize);
          const col = idx % INK_CONFIG.gridSize;
          const key = `${row},${col}`;
          const letterEntry = LETTER_MAP.get(key);
          const isRevealed = revealedCells.has(key);
          const isMissed = missedCells.has(key);
          const isAnimating = animating?.key === key;
          const wordSolved = isRevealed && letterEntry?.wordTexts.some(
            (wt) => wordStates[wt]?.solved,
          );
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
                    : "border border-gold/25"
                  : isAnimating
                  ? "border border-accent/50"
                  : isMissed
                  ? "border border-muted/20"
                  : proximity === "hot"
                  ? "border border-amber-400/50"
                  : proximity === "warm"
                  ? "border border-amber-400/20"
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
                boxShadow: proximity === "hot"
                  ? "inset 0 0 10px #f59e0b30"
                  : proximity === "warm"
                  ? "inset 0 0 6px #f59e0b12"
                  : undefined,
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
                    animation: wordSolved
                      ? "golden-ball-glow 2s ease-in-out infinite"
                      : undefined,
                  }}
                >
                  {letterEntry.letter}
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

              {/* Miss stain */}
              {isMissed && (
                <span
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ animation: "ink-miss-evaporate 1.5s ease-out both" }}
                >
                  <span
                    className="rounded-full opacity-60"
                    style={{
                      width: "60%",
                      height: "60%",
                      background: "radial-gradient(circle, #1a1240, #0d0920)",
                    }}
                  />
                  <span className="absolute text-muted/30" style={{ fontSize: "0.45rem" }}>
                    ×
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
                {/* Pattern + guess indicators */}
                <div className="flex items-center justify-between mb-2.5">
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
              setMissedCells(new Map());
              setProximityCenter(null);
              setInputValues({});
              setInputErrors({});
              setLocalSolved(false);
              setShowSolvedModal(false);
              setShowPicker(false);
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
              animation: "love-letter-enter 0.4s ease-out both",
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
                setShowPicker(true);
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

      {/* Enigma picker */}
      {showPicker && (
        <EnigmaPicker
          onClose={() => {
            setShowPicker(false);
            onSolve();
          }}
        />
      )}
    </div>
  );
}
