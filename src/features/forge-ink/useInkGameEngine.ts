import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import {
  INK_CONFIG,
  LETTER_MAP,
  PROXIMITY_MAP,
  getWordCells,
  type WordState,
} from "./ink-config";
import { useStore } from "../../store";
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
import {
  playHitParticles,
  playWordRipple,
  playCelebration,
  playVictoryShimmer,
} from "./ink-vfx";

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

function computeWordPattern(
  wordText: string,
  revealedCells: Set<string>,
): string[] {
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

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Public interface ──────────────────────────────────────────────────────

export interface InkGameEngine {
  revealedCells: Set<string>;
  missedCells: Set<string>;
  wordStates: Record<string, WordState>;
  dropsLeft: number;
  animating: { key: string; result: "hit" | "miss" } | null;
  animatingMissCells: Set<string>;
  proximityCenter: string | null;
  newlyRevealedCells: Set<string>;
  tapMessage: string | null;
  showSolvedModal: boolean;
  solved: boolean;
  countdown: string;
  activeWords: string[];
  handleCellTap: (row: number, col: number) => void;
  handleWordGuess: (
    wordText: string,
    guess: string,
  ) => "correct" | "wrong" | "ignored";
  dismissVictoryModal: () => void;
  resetAll: () => void;
  getWordPattern: (wordText: string) => string[];
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useInkGameEngine(
  gridRef: RefObject<HTMLDivElement | null>,
  propSolved: boolean,
  onSolve: () => void,
): InkGameEngine {
  const storedGame = useStore((s) => s.inkGameState);
  const setInkGameState = useStore((s) => s.setInkGameState);
  const countdown = useCountdown();

  const isStale = storedGame != null && storedGame.dayStamp !== todayStamp();
  const freshGame = isStale ? null : storedGame;

  // ── Persisted state ──
  const [revealedCells, setRevealedCells] = useState<Set<string>>(
    () => new Set(freshGame?.revealedCells ?? []),
  );
  const [wordStates, setWordStates] = useState<Record<string, WordState>>(
    () => freshGame?.wordStates ?? initWordStates(),
  );
  const [dropsLeft, setDropsLeft] = useState(
    () => freshGame?.dropsLeft ?? INK_CONFIG.maxDrops,
  );
  const [missedCells, setMissedCells] = useState<Set<string>>(
    () => new Set(freshGame?.missedCells ?? []),
  );

  // ── Ephemeral state ──
  const [animatingMissCells, setAnimatingMissCells] = useState<Set<string>>(
    new Set(),
  );
  const [proximityCenter, setProximityCenter] = useState<string | null>(null);
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [animating, setAnimating] = useState<{
    key: string;
    result: "hit" | "miss";
  } | null>(null);
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [localSolved, setLocalSolved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newlyRevealedCells, setNewlyRevealedCells] = useState<Set<string>>(
    new Set(),
  );
  const prevPropSolvedRef = useRef(propSolved);
  const lastTapRef = useRef(0);

  const solved = propSolved || localSolved;

  const showMessage = useCallback((msg: string) => {
    setTapMessage(msg);
    setTimeout(() => setTapMessage(null), 3000);
  }, []);

  // ── Persistence sync ──
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

  // ── Admin re-lock (propSolved true → false) ──
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
    }
    prevPropSolvedRef.current = propSolved;
  }, [propSolved]);

  // ── Victory check ──
  useEffect(() => {
    if (solved) return;
    const allWordsSolved = INK_CONFIG.words.every(
      (w) => wordStates[w.text]?.solved,
    );
    if (!allWordsSolved) return;

    setLocalSolved(true);
    setTimeout(() => {
      playCelebration(gridRef, LETTER_MAP.keys());
      sndScrambleSolved();
      navigator.vibrate?.([50, 30, 50, 30, 100]);
      playVictoryShimmer(gridRef);
      setTimeout(() => setShowSolvedModal(true), 800);
    }, 300);
  }, [wordStates, solved, gridRef]);

  // ── Graceful reset (ink exhausted, all words locked/solved) ──
  useEffect(() => {
    if (solved || dropsLeft > 0 || isResetting) return;
    const allLocked = INK_CONFIG.words.every(
      (w) => wordStates[w.text]?.solved || wordStates[w.text]?.guessesLeft === 0,
    );
    if (!allLocked) return;

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
  }, [dropsLeft, wordStates, solved, isResetting, showMessage]);

  // ── Cell tap handler ──
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
        if (PROXIMITY_MAP.get(key) === "hot") sndInkMissAdjacent();
        else sndInkMiss();
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

          playHitParticles(gridRef, key);

          // Auto-solve fully-revealed words
          const autoSolved = INK_CONFIG.words.filter((word) => {
            if (wordStates[word.text]?.solved) return false;
            return getWordCells(word).every(([r, c]) =>
              newRevealed.has(`${r},${c}`),
            );
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
              navigator.vibrate?.([30, 20, 50]);
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
    (
      wordText: string,
      guess: string,
    ): "correct" | "wrong" | "ignored" => {
      const val = normalize(guess.trim().toUpperCase());
      const state = wordStates[wordText];
      if (!val || !state || state.guessesLeft === 0 || state.solved)
        return "ignored";

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

        playWordRipple(gridRef, word);
        return "correct";
      } else {
        sndInkGuessError();
        setWordStates((prev) => ({
          ...prev,
          [wordText]: {
            ...prev[wordText],
            guessesLeft: Math.max(0, prev[wordText].guessesLeft - 1),
          },
        }));
        return "wrong";
      }
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

  const activeWords = useMemo(
    () => getActiveWordTexts(revealedCells),
    [revealedCells],
  );

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
    showSolvedModal,
    solved,
    countdown,
    activeWords,
    handleCellTap,
    handleWordGuess,
    dismissVictoryModal,
    resetAll,
    getWordPattern: (wordText: string) =>
      computeWordPattern(wordText, revealedCells),
  };
}
