import "./chasse-tresor.css";
import { ENIGMA_DATA_LIST } from "./data";
import { EnigmaSheet } from "./EnigmaSheet";
import { TarotCardBack } from "./TarotCardBack";

export function ChasseTresor(): React.JSX.Element {
  return (
    <div className="ct-page">
      <TarotCardBack />
      {ENIGMA_DATA_LIST.map((enigma, i) => (
        <EnigmaSheet key={enigma.number} enigma={enigma} index={i} />
      ))}
    </div>
  );
}
