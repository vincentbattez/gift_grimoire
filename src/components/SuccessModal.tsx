import { useEffect, useState } from "react";
import { ENIGMAS } from "../config";
import { useStore } from "../store";
import { sndClick } from "../audio";
import { fireEvent } from "../ha";

export function SuccessModal() {
  const boxNumber = useStore((s) => s.successBoxNumber);
  const haEvent = useStore((s) => s.successHaEvent);
  const enigmaId = useStore((s) => s.successEnigmaId);
  const hideSuccessBox = useStore((s) => s.hideSuccessBox);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [displayBoxNumber, setDisplayBoxNumber] = useState<number | null>(null);
  const [displayEnigmaId, setDisplayEnigmaId] = useState<string | null>(null);

  useEffect(() => {
    if (boxNumber === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntered(false);
      return;
    }
    setClosing(false);
    setDisplayBoxNumber(boxNumber);
    setDisplayEnigmaId(enigmaId);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [boxNumber, enigmaId]);

  function handleClose() {
    if (closing) return;
    sndClick();
    if (haEvent) fireEvent(haEvent);
    setClosing(true);
    setEntered(false);
    setTimeout(() => {
      hideSuccessBox();
      setClosing(false);
      setDisplayBoxNumber(null);
      setDisplayEnigmaId(null);
    }, 500);
  }

  const enigmaData = displayEnigmaId ? ENIGMAS.find((e) => e.id === displayEnigmaId) : null;
  const flavorText = enigmaData?.successFlavor ?? null;
  const isVisible = boxNumber !== null || closing;

  return (
    <div
      className={`fixed inset-0 z-[110] bg-black/85 backdrop-blur-[6px] flex items-center justify-center transition-opacity duration-400 ${
        isVisible && !closing ? "opacity-100 pointer-events-auto" : closing ? "opacity-0 pointer-events-none" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`max-w-[340px] w-[85%] rounded-2xl border border-success/30 px-6 py-8 text-center transition-all duration-500 ${
          entered && !closing ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{
          background: "linear-gradient(155deg, #1c1438, #0f1a14)",
          boxShadow: "0 0 40px #4ecca320, 0 0 80px #4ecca310",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rune — stagger 0 */}
        {enigmaData && (
          <div
            className="text-[1.6rem] text-success/30 mb-1 tracking-[0.3em]"
            style={{
              opacity: entered && !closing ? 1 : 0,
              transform: entered && !closing ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              transitionDelay: "0.1s",
            }}
          >
            {enigmaData.rune}
          </div>
        )}
        {/* Gift — stagger 1 */}
        <div
          className="text-[3rem] mb-2"
          style={{
            opacity: entered && !closing ? 1 : 0,
            transform: entered && !closing ? "translateY(0) scale(1)" : "translateY(12px) scale(0.8)",
            transition: "opacity 0.5s ease-out, transform 0.6s cubic-bezier(.34,1.56,.64,1)",
            transitionDelay: "0.25s",
          }}
        >
          🎁
        </div>
        {/* Title — stagger 2 */}
        <h2
          className="font-[var(--font-cinzel-decorative)] text-[1.1rem] text-success mb-2 drop-shadow-[0_0_20px_#4ecca340]"
          style={{
            opacity: entered && !closing ? 1 : 0,
            transform: entered && !closing ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            transitionDelay: "0.45s",
          }}
        >
          Mystère percé
        </h2>
        {/* Flavor text — stagger 3 */}
        {flavorText && (
          <p
            className="text-[1rem] text-text/70 mb-4"
            style={{
              opacity: entered && !closing ? 1 : 0,
              transform: entered && !closing ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              transitionDelay: "0.65s",
            }}
          >
            {flavorText}
          </p>
        )}
        {/* Separator — stagger 4 */}
        <div
          className="h-px mx-auto mb-4"
          style={{
            width: entered && !closing ? "40px" : "0px",
            background: "linear-gradient(to right, transparent, #4ecca34d, transparent)",
            transition: "width 0.6s ease-out",
            transitionDelay: "0.85s",
          }}
        />
        {/* Box reveal — stagger 5 */}
        <div
          style={{
            opacity: entered && !closing ? 1 : 0,
            transform: entered && !closing ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
            transitionDelay: "1s",
          }}
        >
          <p className="text-[0.8rem] text-success/70 leading-relaxed mb-1">
            Le sceau s'est brisé… <br /> Tu peux désormais ouvrir
          </p>
          <p className="text-[1.8rem] font-[var(--font-cinzel-decorative)] text-gold tracking-[0.08em] my-3 drop-shadow-[0_0_16px_#e8c96a40]">
            Boîte n°{displayBoxNumber}
          </p>
        </div>
        {/* Button — stagger 6 */}
        <button
          onClick={handleClose}
          className="mt-2 py-3 px-8 border-none rounded-[14px] bg-gradient-to-br from-[#2a6a4a] to-success text-white font-[var(--font-cinzel)] text-[0.82rem] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.97] shadow-[0_4px_22px_#4ecca328]"
          style={{
            opacity: entered && !closing ? 1 : 0,
            transform: entered && !closing ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            transitionDelay: entered && !closing ? "1.2s" : "0s",
          }}
        >
          Ouvrir
        </button>
      </div>
    </div>
  );
}
