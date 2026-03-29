import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  sndInkDrop,
  sndInkGuessError,
  sndInkHit,
  sndInkMiss,
  sndInkMissAdjacent,
  sndInkWordSolved,
  sndScrambleSolved,
} from "../../../../audio";
import { getWordCells, INK_CONFIG, LETTER_MAP, PROXIMITY_MAP, type WordState } from "../config";
import { useInkStore } from "../store";
import { playCelebration, playHitParticles, playVictoryShimmer, playWordRipple } from "../vfx/ink-vfx";

// ── Private helpers ───────────────────────────────────────────────────────

function initWordStates(): Record<string, WordState> {
  const states: Record<string, WordState> = {};
  for (const word of INK_CONFIG.words) {
    states[word.text] = {
      solved: false,
      guessesLeft: INK_CONFIG.maxGuessesPerWord,
    };
  }

  return states;
}

function computeWordPattern(wordText: string, revealedCells: Set<string>): string[] {
  const word = INK_CONFIG.words.find((w) => w.text === wordText);

  if (!word) {
    throw new Error(`Unknown word: ${wordText}`);
  }

  return Array.from(word.text, (letter, i) => {
    const row = word.direction === "H" ? word.start[0] : word.start[0] + i;
    const col = word.direction === "H" ? word.start[1] + i : word.start[1];

    return revealedCells.has(`${String(row)},${String(col)}`) ? letter : "_";
  });
}

function getActiveWordTexts(revealedCells: Set<string>): string[] {
  return INK_CONFIG.words
    .filter((word) => getWordCells(word).some(([r, c]) => revealedCells.has(`${String(r)},${String(c)}`)))
    .map((w) => w.text);
}

const normalize = (s: string) => s.normalize("NFD").replaceAll(/[\u0300-\u036F]/g, "");

function todayStamp(): string {
  const d = new Date();

  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Public interface ──────────────────────────────────────────────────────

export type InkGameEngine = {
  revealedCells: Set<string>;
  missedCells: Set<string>;
  wordStates: Record<string, WordState>;
  dropsLeft: number;
  animating: { key: string; result: "hit" | "miss" } | null;
  animatingMissCells: Set<string>;
  proximityCenter: string | null;
  newlyRevealedCells: Set<string>;
  tapMessage: string | null;
  isShowingSolvedModal: boolean;
  isSolved: boolean;
  activeWords: string[];
  handleCellTap: (row: number, col: number) => void;
  handleWordGuess: (wordText: string, guess: string) => "correct" | "wrong" | "ignored";
  dismissVictoryModal: () => void;
  resetAll: () => void;
  getWordPattern: (wordText: string) => string[];
};

// ── Hook ──────────────────────────────────────────────────────────────────

export function useInkGameEngine(
  gridRef: RefObject<HTMLDivElement | null>,
  propSolved: boolean,
  onSolve: () => void,
): InkGameEngine {
  const storedGame = useInkStore((s) => s.inkGameState);
  const setInkGameState = useInkStore((s) => s.setInkGameState);
  const dropResetCounter = useInkStore((s) => s.dropResetCounter);
  const isStale = storedGame !== null && storedGame.dayStamp !== todayStamp();
  const freshGame = isStale ? null : storedGame;

  // ── Persisted state ──
  const [revealedCells, setRevealedCells] = useState<Set<string>>(() => new Set(freshGame?.revealedCells));
  const [wordStates, setWordStates] = useState<Record<string, WordState>>(
    () => freshGame?.wordStates ?? initWordStates(),
  );
  const [dropsLeft, setDropsLeft] = useState(() => freshGame?.dropsLeft ?? INK_CONFIG.maxDrops);
  const [missedCells, setMissedCells] = useState<Set<string>>(() => new Set(freshGame?.missedCells));

  // ── Ephemeral state ──
  const [animatingMissCells, setAnimatingMissCells] = useState(new Set<string>());
  const [proximityCenter, setProximityCenter] = useState<string | null>(null);
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [animating, setAnimating] = useState<{
    key: string;
    result: "hit" | "miss";
  } | null>(null);
  const [isShowingSolvedModal, setShowSolvedModal] = useState(false);
  const [isLocalSolved, setLocalSolved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newlyRevealedCells, setNewlyRevealedCells] = useState(new Set<string>());
  const prevPropSolvedRef = useRef(propSolved);
  const dropResetRef = useRef(dropResetCounter);
  const lastTapRef = useRef(0);

  const isSolved = propSolved || isLocalSolved;

  const showMessage = useCallback((msg: string) => {
    setTapMessage(msg);

    setTimeout(() => {
      setTapMessage(null);
    }, 3000);
  }, []);

  // ── Persistence sync ──
  useEffect(() => {
    setInkGameState({
      revealedCells: [...revealedCells],
      missedCells: [...missedCells],
      wordStates,
      dropsLeft,
      dayStamp: todayStamp(),
    });
  }, [revealedCells, missedCells, wordStates, dropsLeft, setInkGameState]);

  // ── Admin re-lock (propSolved true → false) ──
  useEffect(() => {
    if (!propSolved && prevPropSolvedRef.current) {
      setLocalSolved(false); // eslint-disable-line react-hooks/set-state-in-effect -- admin reset
      setShowSolvedModal(false);
      setRevealedCells(new Set());
      setWordStates(initWordStates());
      setDropsLeft(INK_CONFIG.maxDrops);
      setMissedCells(new Set());
      setAnimatingMissCells(new Set());
      setProximityCenter(null);
    }
    prevPropSolvedRef.current = propSolved;
  }, [propSolved]);

  // ── Admin ink-drop reset (signal via store counter) ──
  useEffect(() => {
    if (dropResetCounter === dropResetRef.current) {
      return;
    }
    dropResetRef.current = dropResetCounter;
    setDropsLeft(INK_CONFIG.maxDrops); // eslint-disable-line react-hooks/set-state-in-effect -- admin reset signal
    setAnimatingMissCells(new Set());
    setProximityCenter(null);

    setWordStates((prev) => {
      const next = { ...prev };
      for (const word of INK_CONFIG.words) {
        if (!next[word.text].solved) {
          next[word.text] = { ...next[word.text], guessesLeft: INK_CONFIG.maxGuessesPerWord };
        }
      }

      return next;
    });
  }, [dropResetCounter]);

  // ── Victory check ──
  useEffect(() => {
    if (isSolved) {
      return;
    }
    const isAllWordsSolved = INK_CONFIG.words.every((w) => wordStates[w.text].solved);

    if (!isAllWordsSolved) {
      return;
    }

    setLocalSolved(true); // eslint-disable-line react-hooks/set-state-in-effect -- game completion transition

    setTimeout(() => {
      playCelebration(gridRef, LETTER_MAP.keys());
      sndScrambleSolved();
      navigator.vibrate([50, 30, 50, 30, 100]);
      playVictoryShimmer(gridRef);

      setTimeout(() => {
        setShowSolvedModal(true);
      }, 800);
    }, 300);
  }, [wordStates, isSolved, gridRef]);

  // ── Graceful reset (ink exhausted, all words locked/solved) ──
  useEffect(() => {
    if (isSolved || dropsLeft > 0 || isResetting) {
      return;
    }
    const isAllLocked = INK_CONFIG.words.every(
      (w) => wordStates[w.text].solved || wordStates[w.text].guessesLeft === 0,
    );

    if (!isAllLocked) {
      return;
    }

    setIsResetting(true); // eslint-disable-line react-hooks/set-state-in-effect -- game deadlock recovery

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
          const current = next[word.text];

          if (!current.solved) {
            next[word.text] = {
              ...current,
              guessesLeft: INK_CONFIG.maxGuessesPerWord,
            };
          }
        }

        return next;
      });
      setIsResetting(false);
    }, 3500);
  }, [dropsLeft, wordStates, isSolved, isResetting, showMessage]);

  // ── Cell tap handler ──
  const handleCellTap = useCallback(
    (row: number, col: number) => {
      const now = Date.now();

      if (now - lastTapRef.current < 500) {
        return;
      }
      lastTapRef.current = now;

      const key = `${String(row)},${String(col)}`;

      if (revealedCells.has(key) || missedCells.has(key) || animating !== null || dropsLeft <= 0) {
        return;
      }

      const letterEntry = LETTER_MAP.get(key);
      const result: "hit" | "miss" = letterEntry ? "hit" : "miss";

      if (result === "hit") {
        sndInkDrop(dropsLeft / INK_CONFIG.maxDrops);
        navigator.vibrate(30);
      } else {
        if (PROXIMITY_MAP.get(key) === "hot") {
          sndInkMissAdjacent();
        } else {
          sndInkMiss();
        }
        navigator.vibrate([15, 10, 15]);
        setProximityCenter(key);

        setTimeout(() => {
          setProximityCenter(null);
        }, 2800);
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

          playHitParticles(gridRef, key);

          // Auto-solve fully-revealed words
          const autoSolved = INK_CONFIG.words.filter((word) => {
            if (wordStates[word.text].solved) {
              return false;
            }

            return getWordCells(word).every(([r, c]) => newRevealed.has(`${String(r)},${String(c)}`));
          });

          if (autoSolved.length > 0) {
            setWordStates((prev) => {
              const next = { ...prev };
              for (const word of autoSolved) {
                next[word.text] = { ...next[word.text], solved: true };
              }

              return next;
            });
            for (const word of autoSolved) {
              sndInkWordSolved();
              navigator.vibrate([30, 20, 50]);
              playWordRipple(gridRef, word);
            }
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
    [revealedCells, missedCells, animating, dropsLeft, wordStates, gridRef],
  );

  // ── Word guess handler ──
  const handleWordGuess = useCallback(
    (wordText: string, guess: string): "correct" | "wrong" | "ignored" => {
      const val = normalize(guess.trim().toUpperCase());
      const state = wordStates[wordText];

      if (!val || state.guessesLeft === 0 || state.solved) {
        return "ignored";
      }

      if (val === normalize(wordText)) {
        sndInkWordSolved();
        navigator.vibrate([30, 20, 50]);
        const word = INK_CONFIG.words.find((w) => w.text === wordText);

        if (!word) {
          return "ignored";
        }
        const cells = getWordCells(word);

        setRevealedCells((prev) => {
          const next = new Set(prev);
          cells.forEach(([r, c]) => next.add(`${String(r)},${String(c)}`));

          return next;
        });

        setWordStates((prev) => ({
          ...prev,
          [wordText]: { ...prev[wordText], solved: true },
        }));

        playWordRipple(gridRef, word);

        return "correct";
      }
      sndInkGuessError();

      setWordStates((prev) => ({
        ...prev,
        [wordText]: {
          ...prev[wordText],
          guessesLeft: Math.max(0, prev[wordText].guessesLeft - 1),
        },
      }));

      return "wrong";
    },
    [wordStates, gridRef],
  );

  // ── Actions ──
  const resetAll = useCallback(() => {
    setRevealedCells(new Set());
    setWordStates(initWordStates());
    setDropsLeft(INK_CONFIG.maxDrops);
    setMissedCells(new Set());
    setAnimatingMissCells(new Set());
    setProximityCenter(null);
    setLocalSolved(false);
    setShowSolvedModal(false);
    setIsResetting(false);
  }, []);

  const dismissVictoryModal = useCallback(() => {
    setShowSolvedModal(false);
    onSolve();
  }, [onSolve]);

  const activeWords = useMemo(() => getActiveWordTexts(revealedCells), [revealedCells]);

  return {
    revealedCells,
    missedCells,
    wordStates,
    dropsLeft,
    animating,
    animatingMissCells,
    proximityCenter,
    newlyRevealedCells,
    tapMessage,
    isShowingSolvedModal,
    isSolved,
    activeWords,
    handleCellTap,
    handleWordGuess,
    dismissVictoryModal,
    resetAll,
    getWordPattern: (wordText: string) => computeWordPattern(wordText, revealedCells),
  };
}
