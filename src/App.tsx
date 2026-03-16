import { useEffect } from "react";
import { ENIGMAS } from "./config";
import { Starfield } from "./components/Starfield";
import { Header } from "./components/Header";
import { SpellGrid } from "./components/SpellGrid";
import { SpellModal } from "./components/SpellModal";
import { Toast } from "./components/Toast";
import { triggerUnlockEffect } from "./components/SpellCard";

function useQRUnlock() {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get("unlock") ?? "");
    if (id >= 1 && id <= ENIGMAS.length) {
      history.replaceState({}, "", location.pathname);
      const enigma = ENIGMAS.find((e) => e.id === id);
      if (enigma) {
        setTimeout(() => triggerUnlockEffect(id, enigma.title), 700);
      }
    }
  }, []);
}

export default function App() {
  useQRUnlock();

  return (
    <>
      <Starfield />
      <div className="relative z-1 max-w-[430px] mx-auto px-4 pb-12">
        <Header />
        <SpellGrid />
      </div>
      <SpellModal />
      <Toast />
    </>
  );
}
