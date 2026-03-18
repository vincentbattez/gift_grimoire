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
