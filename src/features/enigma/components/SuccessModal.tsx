import { useEffect, useState } from "react";
import { sndClick } from "@/audio";
import { fireEvent } from "@/ha";
import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";

export function SuccessModal(): React.JSX.Element {
  const boxNumber = useEnigmaStore((s) => s.successBoxNumber);
  const haEvent = useEnigmaStore((s) => s.successHaEvent);
  const enigmaId = useEnigmaStore((s) => s.successEnigmaId);
  const hideSuccessBox = useEnigmaStore((s) => s.hideSuccessBox);
  const [hasEntered, setHasEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [displayBoxNumber, setDisplayBoxNumber] = useState<number | null>(null);
  const [displayEnigmaId, setDisplayEnigmaId] = useState<string | null>(null);

  useEffect(() => {
    if (boxNumber === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasEntered(false);

      return;
    }
    setIsClosing(false);
    setDisplayBoxNumber(boxNumber);
    setDisplayEnigmaId(enigmaId);
    const raf = requestAnimationFrame(() => {
      setHasEntered(true);
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [boxNumber, enigmaId]);

  function handleClose(): void {
    if (isClosing) {
      return;
    }
    sndClick();

    if (haEvent) {
      void fireEvent(haEvent);
    }
    setIsClosing(true);
    setHasEntered(false);

    setTimeout(() => {
      hideSuccessBox();
      setIsClosing(false);
      setDisplayBoxNumber(null);
      setDisplayEnigmaId(null);
    }, 500);
  }

  const enigmaData = displayEnigmaId ? ENIGMA_LIST.find((e) => e.id === displayEnigmaId) : null;
  const flavorText = enigmaData?.successFlavor ?? null;
  const isVisible = boxNumber !== null || isClosing;

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-[6px] transition-opacity duration-400 ${
        isVisible && !isClosing ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="presentation"
      onClick={handleClose}
    >
      <div
        className={`border-success/30 w-[85%] max-w-[340px] rounded-2xl border px-6 py-8 text-center transition-all duration-500 ${
          hasEntered && !isClosing ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{
          background: "linear-gradient(155deg, #1c1438, #0f1a14)",
          boxShadow: "0 0 40px #4ecca320, 0 0 80px #4ecca310",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Rune — stagger 0 */}
        {enigmaData && (
          <div
            className="text-success/30 mb-1 text-[1.6rem] tracking-[0.3em]"
            style={{
              opacity: hasEntered && !isClosing ? 1 : 0,
              transform: hasEntered && !isClosing ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              transitionDelay: "0.1s",
            }}
          >
            {enigmaData.rune}
          </div>
        )}
        {/* Gift — stagger 1 */}
        <div
          className="mb-2 text-[3rem]"
          style={{
            opacity: hasEntered && !isClosing ? 1 : 0,
            transform: hasEntered && !isClosing ? "translateY(0) scale(1)" : "translateY(12px) scale(0.8)",
            transition: "opacity 0.5s ease-out, transform 0.6s cubic-bezier(.34,1.56,.64,1)",
            transitionDelay: "0.25s",
          }}
        >
          🎁
        </div>
        {/* Title — stagger 2 */}
        <h2
          className="text-success mb-2 text-[1.1rem] font-[var(--font-cinzel-decorative)] drop-shadow-[0_0_20px_#4ecca340]"
          style={{
            opacity: hasEntered && !isClosing ? 1 : 0,
            transform: hasEntered && !isClosing ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            transitionDelay: "0.45s",
          }}
        >
          Mystère percé
        </h2>
        {/* Flavor text — stagger 3 */}
        {flavorText && (
          <p
            className="text-text/70 mb-4 text-[1rem]"
            style={{
              opacity: hasEntered && !isClosing ? 1 : 0,
              transform: hasEntered && !isClosing ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              transitionDelay: "0.65s",
            }}
          >
            {flavorText}
          </p>
        )}
        {/* Separator — stagger 4 */}
        <div
          className="mx-auto mb-4 h-px"
          style={{
            width: hasEntered && !isClosing ? "40px" : "0px",
            background: "linear-gradient(to right, transparent, #4ecca34d, transparent)",
            transition: "width 0.6s ease-out",
            transitionDelay: "0.85s",
          }}
        />
        {/* Box reveal — stagger 5 */}
        <div
          style={{
            opacity: hasEntered && !isClosing ? 1 : 0,
            transform: hasEntered && !isClosing ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
            transitionDelay: "1s",
          }}
        >
          <p className="text-success/70 mb-1 text-[0.8rem] leading-relaxed">
            Le sceau s'est brisé… <br /> Tu peux désormais ouvrir
          </p>
          <p className="text-gold my-3 text-[1.8rem] font-[var(--font-cinzel-decorative)] tracking-[0.08em] drop-shadow-[0_0_16px_#e8c96a40]">
            Boîte n°{displayBoxNumber}
          </p>
        </div>
        {/* Button — stagger 6 */}
        <button
          onClick={handleClose}
          className="to-success mt-2 cursor-pointer rounded-[14px] border-none bg-gradient-to-br from-[#2a6a4a] px-8 py-3 text-[0.82rem] font-[var(--font-cinzel)] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_4px_22px_#4ecca328] transition-all duration-200 active:scale-[0.97]"
          style={{
            opacity: hasEntered && !isClosing ? 1 : 0,
            transform: hasEntered && !isClosing ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            transitionDelay: hasEntered && !isClosing ? "1.2s" : "0s",
          }}
        >
          Ouvrir
        </button>
      </div>
    </div>
  );
}
