import { useEffect } from "react";
import { useStore } from "./store";
import { ENIGMAS } from "./config";
import { Starfield } from "./components/Starfield";
import { Header } from "./components/Header";
import { EnigmaGrid } from "./components/EnigmaGrid";
import { EnigmaModal } from "./components/EnigmaModal";
import { Toast } from "./components/Toast";
import { triggerUnlockEffect } from "./components/EnigmaCard";

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

export default function App() {
  useQRUnlock();
  const resetAttempt = useStore((s) => s.resetAttempt);

  return (
    <>
      <Starfield />
      <div className="relative z-1 max-w-[430px] mx-auto px-4 pb-12">
        <Header />
        <EnigmaGrid />
        <button
          onClick={resetAttempt}
          className="w-full mt-20 py-2 text-[0.5rem] text-muted/20 bg-transparent border-none cursor-default select-none"
        >
          reset
        </button>
      </div>
      <EnigmaModal />
      <Toast />
    </>
  );
}
