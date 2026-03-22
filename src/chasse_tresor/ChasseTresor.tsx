import { useRef } from "react";
import { toPng } from "html-to-image";
import "./chasse-tresor.css";
import { ENIGMAS_DATA } from "./data";
import { EnigmaSheet } from "./EnigmaSheet";

async function downloadCardsAsPng(
  cardRefs: React.RefObject<(HTMLDivElement | null)[]>,
) {
  const cards = cardRefs.current;
  if (!cards) return;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card) continue;

    const dataUrl = await toPng(card, { pixelRatio: 3 });
    const link = document.createElement("a");
    link.download = `carte-${ENIGMAS_DATA[i].number}-${ENIGMAS_DATA[i].title.replaceAll(/[^a-zA-ZÀ-ÿ0-9]/g, "_")}.png`;
    link.href = dataUrl;
    link.click();
  }
}

export function ChasseTresor() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div className="ct-page">
      <div className="ct-controls fixed top-5 right-5 z-100 flex gap-2.5">
        <button onClick={() => downloadCardsAsPng(cardRefs)}>
          Télécharger PNG
        </button>
      </div>
      {ENIGMAS_DATA.map((enigma, i) => (
        <EnigmaSheet
          key={enigma.number}
          enigma={enigma}
          index={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
