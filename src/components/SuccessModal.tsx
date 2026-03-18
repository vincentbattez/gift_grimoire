import { useEffect, useState } from "react";
import { useStore } from "../store";
import { sndClick } from "../audio";

export function SuccessModal() {
  const boxNumber = useStore((s) => s.successBoxNumber);
  const hideSuccessBox = useStore((s) => s.hideSuccessBox);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (boxNumber === null) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [boxNumber]);

  function handleClose() {
    sndClick();
    hideSuccessBox();
  }

  return (
    <div
      className={`fixed inset-0 z-[110] bg-black/85 backdrop-blur-[6px] flex items-center justify-center transition-opacity duration-400 ${
        boxNumber !== null ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`max-w-[340px] w-[85%] rounded-2xl border border-success/30 px-6 py-8 text-center transition-all duration-500 ${
          entered ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{
          background: "linear-gradient(155deg, #1c1438, #0f1a14)",
          boxShadow: "0 0 40px #4ecca320, 0 0 80px #4ecca310",
          transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[3rem] mb-3">
          🎁
        </div>
        <h2 className="font-[var(--font-cinzel-decorative)] text-[1.1rem] text-success mb-3 drop-shadow-[0_0_20px_#4ecca340]">
          Bien joué !
        </h2>
        <p className="text-[0.9rem] text-text leading-relaxed mb-1">
          Tu peux maintenant ouvrir
        </p>
        <p className="text-[1.8rem] font-[var(--font-cinzel-decorative)] text-gold tracking-[0.08em] my-3 drop-shadow-[0_0_16px_#e8c96a40]">
          la boîte n°{boxNumber}
        </p>
        <button
          onClick={handleClose}
          className="mt-4 py-3 px-8 border-none rounded-[14px] bg-gradient-to-br from-[#2a6a4a] to-success text-white font-[var(--font-cinzel)] text-[0.82rem] font-semibold tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 active:scale-[0.97] shadow-[0_4px_22px_#4ecca328]"
        >
          Compris !
        </button>
      </div>
    </div>
  );
}
