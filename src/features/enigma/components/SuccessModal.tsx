import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sndClick } from "@/audio";
import { fireEvent } from "@/ha";
import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";

function staggerStyle(
  active: boolean,
  delay: string,
  options?: { translateY?: string; scale?: string; transition?: string },
): CSSProperties {
  const ty = options?.translateY ?? "8px";
  const inactiveTransform = options?.scale ? `translateY(${ty}) scale(${options.scale})` : `translateY(${ty})`;
  const activeTransform = options?.scale ? "translateY(0) scale(1)" : "translateY(0)";

  return {
    opacity: active ? 1 : 0,
    transform: active ? activeTransform : inactiveTransform,
    transition: options?.transition ?? "opacity 0.5s ease-out, transform 0.5s ease-out",
    transitionDelay: delay,
  };
}

export function SuccessModal(): React.JSX.Element {
  const { t } = useTranslation("enigma");
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
  const isVisible = boxNumber !== null || isClosing;
  const isActive = hasEntered && !isClosing;

  const runeStyle = staggerStyle(isActive, "0.1s");
  const giftStyle = staggerStyle(isActive, "0.25s", {
    translateY: "12px",
    scale: "0.8",
    transition: "opacity 0.5s ease-out, transform 0.6s cubic-bezier(.34,1.56,.64,1)",
  });
  const titleStyle = staggerStyle(isActive, "0.45s", {
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  });
  const flavorStyle = staggerStyle(isActive, "0.65s");
  const separatorStyle: CSSProperties = {
    width: isActive ? "40px" : "0px",
    background: "linear-gradient(to right, transparent, #4ecca34d, transparent)",
    transition: "width 0.6s ease-out",
    transitionDelay: "0.85s",
  };
  const boxRevealStyle = staggerStyle(isActive, "1s", { translateY: "12px" });
  const buttonStyle = staggerStyle(isActive, isActive ? "1.2s" : "0s", {
    translateY: "10px",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  });

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
          isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
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
          <div className="text-success/30 mb-1 text-[1.6rem] tracking-[0.3em]" style={runeStyle}>
            {enigmaData.rune}
          </div>
        )}
        {/* Gift — stagger 1 */}
        <div className="mb-2 text-[3rem]" style={giftStyle}>
          🎁
        </div>
        {/* Title — stagger 2 */}
        <h2
          className="text-success mb-2 text-[1.1rem] font-[var(--font-cinzel-decorative)] drop-shadow-[0_0_20px_#4ecca340]"
          style={titleStyle}
        >
          {t("success.title")}
        </h2>
        {/* Flavor text — stagger 3 */}
        {enigmaData && (
          <p className="text-text/70 mb-4 text-[1rem]" style={flavorStyle}>
            {enigmaData.successFlavor}
          </p>
        )}
        {/* Separator — stagger 4 */}
        <div className="mx-auto mb-4 h-px" style={separatorStyle} />
        {/* Box reveal — stagger 5 */}
        <div style={boxRevealStyle}>
          <p className="text-success/70 mb-1 text-[0.8rem] leading-relaxed">
            {t("success.sealBroken")} <br /> {t("success.canOpen")}
          </p>
          <p className="text-gold my-3 text-[1.8rem] font-[var(--font-cinzel-decorative)] tracking-[0.08em] drop-shadow-[0_0_16px_#e8c96a40]">
            {t("success.boxNumber", { number: displayBoxNumber })}
          </p>
        </div>
        {/* Button — stagger 6 */}
        <button
          onClick={handleClose}
          className="to-success mt-2 cursor-pointer rounded-[14px] border-none bg-gradient-to-br from-[#2a6a4a] px-8 py-3 text-[0.82rem] font-[var(--font-cinzel)] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_4px_22px_#4ecca328] transition-all duration-200 active:scale-[0.97]"
          style={buttonStyle}
        >
          {t("success.open")}
        </button>
      </div>
    </div>
  );
}
