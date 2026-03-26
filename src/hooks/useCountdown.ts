import { useState, useEffect } from "react";
import { msUntilMidnight } from "../store";

/** Retourne un label HH:MM:SS mis à jour chaque seconde jusqu'à minuit */
export function useCountdown(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function tick() {
      const ms = msUntilMidnight();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1_000);
      setLabel(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return label;
}
