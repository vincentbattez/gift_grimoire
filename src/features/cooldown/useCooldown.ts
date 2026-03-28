import { useState, useEffect, useCallback } from "react";
import type { CooldownState } from "./types";

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * Hook réutilisable de cooldown.
 *
 * @param lastTriggeredAt - Timestamp (ms) du dernier déclenchement, ou null si jamais déclenché
 * @param durationMs      - Durée du cooldown en ms. Si null, le cooldown expire à minuit.
 *
 * @returns CooldownState avec active, remainingMs, label
 */
export function useCooldown(
  lastTriggeredAt: number | null,
  durationMs: number | null = null,
): CooldownState {
  const computeRemaining = useCallback((): number => {
    if (lastTriggeredAt == null) return 0;

    if (durationMs == null) {
      // Cooldown daily : actif si même jour
      if (!isSameDay(lastTriggeredAt, Date.now())) return 0;
      return msUntilMidnight();
    }

    // Cooldown fixe
    const elapsed = Date.now() - lastTriggeredAt;
    return Math.max(0, durationMs - elapsed);
  }, [lastTriggeredAt, durationMs]);

  const [remaining, setRemaining] = useState(computeRemaining);

  useEffect(() => {
    setRemaining(computeRemaining());
    if (computeRemaining() <= 0) return;

    const id = setInterval(() => {
      const r = computeRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(id);
    }, 1_000);

    return () => clearInterval(id);
  }, [computeRemaining]);

  return {
    active: remaining > 0,
    remainingMs: remaining,
    label: remaining > 0 ? formatMs(remaining) : "00:00:00",
  };
}
