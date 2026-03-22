import type { EnigmaData } from "./data";
import { CornerOrnaments } from "./CornerOrnament";
import { WaxSeal } from "./WaxSeal";

export function EnigmaSheet({ enigma }: { enigma: EnigmaData }) {
  return (
    <div className="enigma-sheet">
      <div className="ornate-border" />
      <CornerOrnaments />
      {enigma.stains.map((s) => (
        <div key={s} className={`stain stain-${s}`} />
      ))}
      <div className="sheet-content">
        <div className="ct-header">
          <div className="series-title">La Chasse au Trésor</div>
          <div className="enigma-number">{enigma.number}</div>
          <div className="enigma-title-section">
            <div className="enigma-title">
              {enigma.title.split("\n").map((line, i, arr) => (
                <span key={i}>
                {line}
                  {i < arr.length - 1 && <br />}
              </span>
              ))}
            </div>
          </div>
        </div>
        <div className="riddle-section">
          <div className="riddle-decoration">⁕ ⁕ ⁕</div>
          <div className="riddle-text">{enigma.riddle}</div>
          <div className="riddle-decoration-bottom">⁕ ⁕ ⁕</div>
        </div>
        <div className="ct-footer">
        </div>
      </div>
      <WaxSeal />
    </div>
  );
}
