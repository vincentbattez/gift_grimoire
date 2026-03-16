import { HA_URL, HA_TOKEN } from "./config";

export async function fireEvent(event: string) {
  try {
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
