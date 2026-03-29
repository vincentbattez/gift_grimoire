import { sndOk } from "@/audio";
import { spawnParticles } from "@/particles";
import { useUIStore } from "@/store";
import { useEnigmaStore } from "./store";

/** Called by admin button — starts the cinematic overlay animation */
export function triggerUnlockEffect(id: string, enigmaTitle: string): void {
  const store = useEnigmaStore.getState();

  if (store.enigmas[id].unlocked || store.enigmas[id].solved) {
    return;
  }
  store.startUnlocking(id, enigmaTitle);
}

/** Called by UnlockOverlay when the animation reaches its climax — actually unlocks the card */
export function triggerUnlockReveal(id: string): void {
  const store = useEnigmaStore.getState();

  if (store.enigmas[id].unlocked || store.enigmas[id].solved) {
    return;
  }

  store.unlock(id);
  // Toast affiché après fermeture de l'overlay (dans playUnlockCardEffect)
}

/** Called by EnigmaCard after the overlay has fully closed */
export function playUnlockCardEffect(id: string, enigmaTitle?: string): void {
  const el = document.querySelector(`[data-card-id="${id}"]`);

  if (!el) {
    return;
  }

  // SFX de reveal carte
  sndOk();

  // Toast maintenant que l'overlay est parti
  if (enigmaTitle) {
    useUIStore.getState().showToast(`✦ « ${enigmaTitle} » déverrouillé !`);
  }

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  const card = el.firstElementChild as HTMLElement | null;

  if (card) {
    card.style.animation = "unlock-flash 0.7s ease-out";

    card.addEventListener(
      "animationend",
      () => {
        card.style.animation = "";
      },
      { once: true },
    );
  }

  const r = el.getBoundingClientRect();
  spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 28, "#9b6dff");
}
