import { useState, useCallback } from "react";
import { INK_CONFIG, type WordState } from "../config";

interface InkWordCardProps {
  wordText: string;
  state: WordState;
  pattern: string[];
  direction: "H" | "V";
  onGuess: (wordText: string, guess: string) => "correct" | "wrong" | "ignored";
}

export function InkWordCard({
  wordText,
  state,
  pattern,
  direction,
  onGuess,
}: InkWordCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const isLocked = state.guessesLeft === 0 && !state.solved;

  const handleSubmit = useCallback(() => {
    const result = onGuess(wordText, inputValue);
    if (result === "ignored") return;
    setInputValue("");
    if (result === "wrong") {
      setHasError(true);
      setTimeout(() => setHasError(false), 4000);
    } else {
      setHasError(false);
    }
  }, [wordText, inputValue, onGuess]);

  return (
    <div
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
          <span
            className="text-[0.5rem] text-muted/30"
            title={direction === "H" ? "horizontal" : "vertical"}
          >
            {direction === "H" ? "→" : "↓"}
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
                  boxShadow:
                    i < state.guessesLeft ? "0 0 4px #9b6dff40" : "none",
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
            onClick={handleSubmit}
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
}
