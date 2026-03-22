import "./chasse-tresor.css";
import { ENIGMAS_DATA } from "./data";
import { EnigmaSheet } from "./EnigmaSheet";
import { TarotCardBack } from "./TarotCardBack";

export function ChasseTresor() {
  return (
    <div className="ct-page">
      <TarotCardBack />
      {ENIGMAS_DATA.map((enigma, i) => (
        <EnigmaSheet key={enigma.number} enigma={enigma} index={i} />
      ))}
    </div>
  );
}
