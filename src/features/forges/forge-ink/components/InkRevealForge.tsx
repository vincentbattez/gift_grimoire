import { useRef, useState } from "react";
import { useAdmin } from "@features/admin/useAdmin";
import { CooldownLabel } from "@features/cooldown/components/CooldownLabel";
import { INK_CONFIG, LETTER_MAP, PROXIMITY_MAP } from "@features/forges/forge-ink/config";
import { useInkGameEngine } from "@features/forges/forge-ink/hooks/useInkGameEngine";
import type { ForgeProps } from "@features/forges/types";
import { InkCell } from "./InkCell";
import { InkDropIndicator } from "./InkDropIndicator";
import { InkSolvedView } from "./InkSolvedView";
import { InkVictoryModal } from "./InkVictoryModal";
import { InkWordCard } from "./InkWordCard";

export function InkRevealForge({ solved: propSolved, onSolve }: ForgeProps): React.JSX.Element {
  const isAdmin = useAdmin();
  const gridRef = useRef<HTMLDivElement>(null);
  const engine = useInkGameEngine(gridRef, propSolved, onSolve);
  const [mountedAt] = useState(() => Date.now());

  if (propSolved && !engine.isShowingSolvedModal) {
    return <InkSolvedView />;
  }

  return (
    <div className="mt-4">
      <InkDropIndicator dropsLeft={engine.dropsLeft} />

      <div className="text-center text-[0.45rem] tracking-[0.15em] text-muted/30 font-mono mb-4">
        <CooldownLabel lastTriggeredAt={mountedAt} prefix="Reset dans" />
      </div>

      {engine.tapMessage && (
        <div
          key={engine.tapMessage}
          className="text-center text-[0.55rem] text-gold/80 italic tracking-wide mb-3 px-4"
          style={{ animation: "forge-unblur 0.3s ease-out both" }}
        >
          {engine.tapMessage}
        </div>
      )}

      {engine.revealedCellList.size === 0 && engine.missedCellList.size === 0 && !engine.isSolved && (
        <div className="text-center text-[0.45rem] text-muted/40 italic tracking-wide mb-3">
          Touche une case pour y verser de l'encre
        </div>
      )}

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid gap-[3px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${String(INK_CONFIG.gridCols)}, 1fr)`,
          maxWidth: "min(100%, 358px)",
          touchAction: "manipulation",
        }}
      >
        {Array.from({ length: INK_CONFIG.gridCols * INK_CONFIG.gridRows }, (_, idx) => {
          const row = Math.floor(idx / INK_CONFIG.gridCols);
          const color = idx % INK_CONFIG.gridCols;
          const key = `${String(row)},${String(color)}`;
          const letterEntry = LETTER_MAP.get(key);
          const isRevealed = engine.revealedCellList.has(key);
          const isMissed = engine.missedCellList.has(key);
          const isAnimating = engine.animating?.key === key;

          const isHotLetter =
            !!letterEntry &&
            !isRevealed &&
            !!engine.proximityCenter &&
            (() => {
              const [cr, cc] = engine.proximityCenter.split(",").map(Number);

              return (Math.abs(row - cr) === 1 && color === cc) || (row === cr && Math.abs(color - cc) === 1);
            })();

          let proximity: "hot" | "warm" | undefined;

          if (engine.proximityCenter && !isRevealed && !isMissed && !isAnimating) {
            const [cr, cc] = engine.proximityCenter.split(",").map(Number);
            const isAdjacentToMiss =
              (Math.abs(row - cr) === 1 && color === cc) || (row === cr && Math.abs(color - cc) === 1);

            if (isAdjacentToMiss) {
              proximity = PROXIMITY_MAP.get(key);
            }
          }

          return (
            <InkCell
              key={key}
              cellKey={key}
              row={row}
              color={color}
              letter={letterEntry?.letter}
              isRevealed={isRevealed}
              isMissed={isMissed}
              isAnimating={isAnimating}
              isAnimatingHit={isAnimating && engine.animating?.result === "hit"}
              wordSolved={isRevealed && !!letterEntry?.wordTextList.some((wt) => engine.wordStates[wt].solved)}
              isNewlyRevealed={engine.newlyRevealedCells.has(key)}
              isAnimatingMiss={engine.animatingMissCells.has(key)}
              isHotLetter={isHotLetter}
              proximity={proximity}
              proximityCenter={engine.proximityCenter}
              disabled={engine.isSolved}
              onTap={engine.handleCellTap}
            />
          );
        })}
      </div>

      {/* Words */}
      {engine.activeWordList.length > 0 && (
        <div className="mt-5 flex flex-color gap-3">
          <div className="text-center text-[0.45rem] tracking-[0.25em] text-muted/40 uppercase">— Mots à révéler —</div>
          {engine.activeWordList.map((wordText) => {
            const state = engine.wordStates[wordText];
            const word = INK_CONFIG.wordList.find((w) => w.text === wordText);

            return (
              <InkWordCard
                key={wordText}
                wordText={wordText}
                state={state}
                patternList={engine.getWordPattern(wordText)}
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

      {engine.isShowingSolvedModal && <InkVictoryModal onContinue={engine.dismissVictoryModal} />}
    </div>
  );
}
