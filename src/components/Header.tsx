import {useStore} from "../store";
import {ENIGMAS} from "../config";
import {ProgressBar} from "./ProgressBar.tsx";

export function Header() {
  const enigmas = useStore((s) => s.enigmas);
  const solved = Object.values(enigmas).filter((e) => e.solved).length;
  const pct = (solved / ENIGMAS.length) * 100;

  return (
    <header className="text-center pt-11 pb-5">
      <span
        className="text-[2.8rem] block mb-3.5 drop-shadow-[0_0_16px_#9b6dff]"
        style={{animation: "bob 3.5s ease-in-out infinite"}}
      >
        ✦
      </span>
      <h1
        className="font-[var(--font-cinzel-decorative)] text-[1.55rem] text-gold leading-tight tracking-wide drop-shadow-[0_0_30px_#e8c96a55]">
        Le Grimoire
        <br/>
        Ensorcelé de Léa
      </h1>
      <p className="text-[0.72rem] text-muted mt-2.5 tracking-[0.15em] uppercase">
        Un sort protège chaque rune… <br/> sauras-tu le briser ?
      </p>
      <ProgressBar progress_pct={pct} />
    </header>
  );
}
