import { useEffect, useRef, useState } from "react";
import { useStore, isAttemptUsedToday, msUntilMidnight } from "./store";
import { ENIGMAS } from "./config";
import { Starfield } from "./components/Starfield";
import { Header } from "./components/Header";
import { EnigmaGrid } from "./components/EnigmaGrid";
import { EnigmaModal } from "./components/EnigmaModal";
import { Toast } from "./components/Toast";
import { triggerUnlockEffect } from "./unlock";
import { initAdmin, useAdmin } from "./useAdmin";

initAdmin();

function useQRUnlock() {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("unlock");
    if (!raw) return;
    const enigma = ENIGMAS.find((e) => String(e.id) === raw);
    if (enigma) {
      history.replaceState({}, "", location.pathname);
      setTimeout(() => triggerUnlockEffect(enigma.id, enigma.title), 700);
    }
  }, []);
}

function AttemptBadge() {
  const lastAttempt = useStore((s) => s.lastAttempt);
  const attemptUsed = isAttemptUsedToday(lastAttempt);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!attemptUsed) return;
    function tick() {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [attemptUsed]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      {attemptUsed ? (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#1c1438]/90 border border-danger/30 backdrop-blur-md shadow-[0_0_20px_#ff6b8a15]">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-[0.7rem] text-danger font-semibold tracking-wide">
            {countdown}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-[#1c1438]/90 border border-success/30 backdrop-blur-md shadow-[0_0_20px_#4ecca315]">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[0.7rem] text-success font-semibold tracking-wide">
            1 essai disponible
          </span>
        </div>
      )}
    </div>
  );
}

function ScreenFlash() {
  const celebrateCardId = useStore((s) => s.celebrateCardId);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!celebrateCardId) return;
    const el = ref.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight; // force reflow
    el.style.animation = "screen-flash 0.5s ease-out forwards";
  }, [celebrateCardId]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[90] pointer-events-none opacity-0"
      style={{
        background: "radial-gradient(circle at 50% 50%, #e8c96a40, #4ecca320, transparent 70%)",
      }}
    />
  );
}

export default function App() {
  useQRUnlock();
  const resetAttempt = useStore((s) => s.resetAttempt);
  const isAdmin = useAdmin();

  return (
    <>
      <Starfield />
      <div className="relative z-1 max-w-[430px] mx-auto px-4 pb-12">
        <Header />
        <EnigmaGrid isAdmin={isAdmin} />
        <button
          onClick={resetAttempt}
          className="w-full mt-20 py-2 text-[0.5rem] text-muted/20 bg-transparent border-none cursor-default select-none"
        >
          reset
        </button>
      </div>
      <ScreenFlash />
      <AttemptBadge />
      <EnigmaModal />
      <Toast />
    </>
  );
}
