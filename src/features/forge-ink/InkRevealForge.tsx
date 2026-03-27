import { useRef } from "react";
import { INK_CONFIG, LETTER_MAP, PROXIMITY_MAP } from "./ink-config";
import { useInkGameEngine } from "./useInkGameEngine";
import { useAdmin } from "../../useAdmin";
import type { ForgeProps } from "../../types/forge";
import { InkCell } from "./InkCell";
import { InkDropIndicator } from "./InkDropIndicator";
import { InkWordCard } from "./InkWordCard";
import { InkVictoryModal } from "./InkVictoryModal";
import { InkSolvedView } from "./InkSolvedView";

export function InkRevealForge({ solved: propSolved, onSolve }: ForgeProps) {
  const isAdmin = useAdmin();
  const gridRef = useRef<HTMLDivElement>(null);
  const engine = useInkGameEngine(gridRef, propSolved, onSolve);

  if (propSolved && !engine.showSolvedModal) {
    return <InkSolvedView />;
  }

  return (
    <div className="mt-4">
      <InkDropIndicator dropsLeft={engine.dropsLeft} />

      {engine.countdown && (
        <div className="text-center text-[0.45rem] tracking-[0.15em] text-muted/30 font-mono mb-4">
          Reset dans {engine.countdown}
        </div>
      )}

      {engine.tapMessage && (
        <div
          key={engine.tapMessage}
          className="text-center text-[0.55rem] text-gold/80 italic tracking-wide mb-3 px-4"
          style={{ animation: "forge-unblur 0.3s ease-out both" }}
        >
          {engine.tapMessage}
        </div>
      )}

      {engine.revealedCells.size === 0 &&
        engine.missedCells.size === 0 &&
        !engine.solved && (
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
        {Array.from(
          { length: INK_CONFIG.gridCols * INK_CONFIG.gridRows },
          (_, idx) => {
            const row = Math.floor(idx / INK_CONFIG.gridCols);
            const col = idx % INK_CONFIG.gridCols;
            const key = `${row},${col}`;
            const letterEntry = LETTER_MAP.get(key);
            const isRevealed = engine.revealedCells.has(key);
            const isMissed = engine.missedCells.has(key);
            const isAnimating = engine.animating?.key === key;

            const isHotLetter =
              !!letterEntry &&
              !isRevealed &&
              !!engine.proximityCenter &&
              (() => {
                const [cr, cc] = engine.proximityCenter!
                  .split(",")
                  .map(Number);
                return (
                  (Math.abs(row - cr) === 1 && col === cc) ||
                  (row === cr && Math.abs(col - cc) === 1)
                );
              })();

            const proximity = (() => {
              if (
                !engine.proximityCenter ||
                isRevealed ||
                isMissed ||
                isAnimating
              )
                return undefined;
              const [cr, cc] = engine.proximityCenter
                .split(",")
                .map(Number);
              const isAdjacentToMiss =
                (Math.abs(row - cr) === 1 && col === cc) ||
                (row === cr && Math.abs(col - cc) === 1);
              return isAdjacentToMiss ? PROXIMITY_MAP.get(key) : undefined;
            })();

            return (
              <InkCell
                key={key}
                cellKey={key}
                row={row}
                col={col}
                letter={letterEntry?.letter}
                isRevealed={isRevealed}
                isMissed={isMissed}
                isAnimating={!!isAnimating}
                isAnimatingHit={
                  !!isAnimating && engine.animating?.result === "hit"
                }
                wordSolved={
                  isRevealed &&
                  !!letterEntry?.wordTexts.some(
                    (wt) => engine.wordStates[wt]?.solved,
                  )
                }
                isNewlyRevealed={engine.newlyRevealedCells.has(key)}
                isAnimatingMiss={engine.animatingMissCells.has(key)}
                isHotLetter={isHotLetter}
                proximity={proximity}
                proximityCenter={engine.proximityCenter}
                disabled={engine.solved}
                onTap={engine.handleCellTap}
              />
            );
          },
        )}
      </div>

      {/* Words */}
      {engine.activeWords.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          <div className="text-center text-[0.45rem] tracking-[0.25em] text-muted/40 uppercase">
            — Mots a reveler —
          </div>
          {engine.activeWords.map((wordText) => {
            const state = engine.wordStates[wordText];
            if (!state) return null;
            const word = INK_CONFIG.words.find((w) => w.text === wordText);
            return (
              <InkWordCard
                key={wordText}
                wordText={wordText}
                state={state}
                pattern={engine.getWordPattern(wordText)}
                direction={word?.direction ?? "H"}
                onGuess={engine.handleWordGuess}
              />
            );
          })}
        </div>
      )}

      {/* Admin reset */}
      {isAdmin && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={engine.resetAll}
            className="px-3 py-1 rounded-md text-[0.55rem] tracking-[0.15em] uppercase
              border border-danger/30 text-danger/50 bg-danger/5
              hover:border-danger/60 hover:text-danger/80 hover:bg-danger/10
              transition-all duration-150 active:scale-95"
          >
            ↺ Reset jeu
          </button>
        </div>
      )}

      {engine.showSolvedModal && (
        <InkVictoryModal onContinue={engine.dismissVictoryModal} />
      )}
    </div>
  );
}
