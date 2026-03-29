import { useEffect, useState } from "react";
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

  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function computeRemaining(lastTriggeredAt: number | null, durationMs: number | null): number {
  if (lastTriggeredAt === null) {
    return 0;
  }

  if (durationMs === null) {
    if (!isSameDay(lastTriggeredAt, Date.now())) {
      return 0;
    }

    return msUntilMidnight();
  }

  const elapsed = Date.now() - lastTriggeredAt;

  return Math.max(0, durationMs - elapsed);
}

/**
 * Hook réutilisable de cooldown.
 *
 * @param lastTriggeredAt - Timestamp (ms) du dernier déclenchement, ou null si jamais déclenché
 * @param durationMs      - Durée du cooldown en ms. Si null, le cooldown expire à minuit.
 */
export function useCooldown(lastTriggeredAt: number | null, durationMs: number | null = null): CooldownState {
  // Tick force un re-render chaque seconde pour recalculer remaining
  const [, tick] = useState(0);

  const remaining = computeRemaining(lastTriggeredAt, durationMs);
  const isActive = remaining > 0;

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const id = setInterval(() => {
      tick((n) => n + 1);
    }, 1_000);

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(id);
    };
  }, [isActive]);

  return {
    active: isActive,
    remainingMs: remaining,
    label: isActive ? formatMs(remaining) : "00:00:00",
  };
}
