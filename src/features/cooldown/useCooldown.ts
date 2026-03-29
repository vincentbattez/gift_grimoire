import { useEffect, useState } from "react";
import type { CooldownState } from "./types";

function formatMs(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  return midnight.getTime() - now.getTime();
}

function isSameDay(timestampA: number, timestampB: number): boolean {
  const dateA = new Date(timestampA);
  const dateB = new Date(timestampB);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
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
