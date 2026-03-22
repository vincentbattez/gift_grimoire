import "./chasse-tresor.css";
import { ENIGMAS_DATA } from "./data";
import { EnigmaSheet } from "./EnigmaSheet";

export function ChasseTresor() {
  return (
    <div className="ct-page">
      <div className="ct-controls fixed top-5 right-5 z-100 flex gap-2.5">
        <button onClick={() => window.print()}>Imprimer</button>
      </div>
      {ENIGMAS_DATA.map((enigma, i) => (
        <EnigmaSheet key={enigma.number} enigma={enigma} index={i} />
      ))}
    </div>
  );
}
