import { ENIGMA_LIST } from "@features/enigma/config";
import { useEnigmaStore } from "@features/enigma/store";
import { ProgressBar } from "./ProgressBar.tsx";

export function Header(): React.JSX.Element {
  const enigmas = useEnigmaStore((s) => s.enigmas);
  const solved = Object.values(enigmas).filter((e) => e.solved).length;
  const pct = (solved / ENIGMA_LIST.length) * 100;

  return (
    <header className="pt-11 pb-5 text-center">
      <span
        className="mb-3.5 block text-[2.8rem] drop-shadow-[0_0_16px_#9b6dff]"
        style={{ animation: "bob 3.5s ease-in-out infinite" }}
      >
        ✦
      </span>
      <h1 className="text-gold text-[1.55rem] leading-tight font-[var(--font-cinzel-decorative)] tracking-wide drop-shadow-[0_0_30px_#e8c96a55]">
        Le Grimoire
        <br />
        Ensorcelé de Léa
      </h1>
      <p className="text-muted mt-2.5 text-[0.72rem] tracking-[0.15em] uppercase">
        Un sort protège chaque rune… <br /> sauras-tu le briser ?
      </p>
      <ProgressBar progressPercentage={pct} />
    </header>
  );
}
