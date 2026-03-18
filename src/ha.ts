import { env } from "./env";

export async function getEntityState(entityId: string): Promise<string | null> {
  try {
    const { HA_URL, HA_TOKEN } = env;
    const r = await fetch(`${HA_URL}/api/states/${entityId}`, {
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.state as string;
  } catch {
    return null;
  }
}

/** Poll a binary_sensor until it matches targetState, or timeout */
export function pollEntityState(
  entityId: string,
  targetState: string,
  timeoutMs: number,
  intervalMs = 500,
): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      clearInterval(poller);
      resolve(result);
    };

    const timer = setTimeout(() => done(false), timeoutMs);
    const poller = setInterval(async () => {
      const state = await getEntityState(entityId);
      if (state === targetState) done(true);
    }, intervalMs);

    // Check immediately
    getEntityState(entityId).then((s) => { if (s === targetState) done(true); });
  });
}

export async function fireEvent(event: string) {
  try {
    const { HA_URL, HA_TOKEN } = env;
    const r = await fetch(`${HA_URL}/api/events/${event}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: "grimoire" }),
    });
    console.log(r.ok ? `HA event: ${event}` : `HA error: ${r.status}`);
  } catch (err) {
    console.error("HA error:", err);
  }
}
