import { useEffect, useRef, useState } from "react";
import { useEnigmaStore } from "./features/enigma/store";
import { useCooldownStore } from "./features/cooldown/store";
import { ENIGMAS } from "./features/enigma/config";
import { Starfield } from "./components/Starfield";
import { Header } from "./components/Header";
import { EnigmaGrid } from "./features/enigma/components/EnigmaGrid";
import { EnigmaModal } from "./features/enigma/components/EnigmaModal";
import { Toast } from "./components/Toast";
import { UnlockOverlay } from "./features/enigma/components/UnlockOverlay";
import { SuccessModal } from "./features/enigma/components/SuccessModal";
import { LoveLetterModal } from "./features/enigma/components/LoveLetterModal";
import { FinaleModal } from "./features/finale/components/FinaleModal";
import { IntroModal } from "./components/IntroModal";
import { CooldownBadge } from "./features/cooldown/components/CooldownBadge";
import { triggerUnlockEffect } from "./features/enigma/unlock";
import { initAdmin, logoutAdmin, useAdmin } from "./features/admin/useAdmin";
import { fireEvent } from "./ha";
import { useMagnetStore } from "./features/forges/forge-magnet/store";

initAdmin();

let shouldShowIntro = false;

function initGrimoireInit() {
  const params = new URLSearchParams(location.search);
  if (params.get("init") !== "true") return;
  params.delete("init");
  const qs = params.toString();
  history.replaceState({}, "", location.pathname + (qs ? `?${qs}` : ""));
  fireEvent("gift_grimoire-init");
  shouldShowIntro = true;
}

initGrimoireInit();

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

function ScreenFlash() {
  const celebrateCardId = useEnigmaStore((s) => s.celebrateCardId);
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
  const resetAttempt = useCooldownStore((s) => s.resetAttempt);
  const isAdmin = useAdmin();
  const [showIntro, setShowIntro] = useState(shouldShowIntro);

  return (
    <>
      <Starfield />
      <div className="relative z-1 max-w-[430px] mx-auto px-4 pb-12">
        <Header />
        <EnigmaGrid isAdmin={isAdmin} />
        <p className="mt-6 text-center text-[0.6rem] text-muted/80">
          <span className="text-danger/50 font-bold">❤</span> Imaginé et developpé <span className="text-danger/50 font-bold">avec amour</span> pour Léamour - 2026 <span className="text-danger/50 font-bold">❤</span>
        </p>
        <button
          onClick={() => { resetAttempt(); useMagnetStore.getState().reset(); }}
          className="w-full mt-2 mb-4 py-2 text-[0.5rem] text-muted/20 bg-transparent border-none cursor-default select-none"
        >
          reset
        </button>
        {isAdmin && (
          <button
            onClick={logoutAdmin}
            className="w-full py-1 text-[0.55rem] text-amber-400/40 hover:text-amber-400/80 bg-transparent border border-amber-400/20 hover:border-amber-400/50 rounded transition-colors cursor-pointer"
          >
            ⚙ quitter le mode admin
          </button>
        )}
      </div>
      <ScreenFlash />
      <CooldownBadge />
      <EnigmaModal />
      <Toast />
      <UnlockOverlay />
      <SuccessModal />
      <LoveLetterModal />
      <FinaleModal />
      {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}
    </>
  );
}
