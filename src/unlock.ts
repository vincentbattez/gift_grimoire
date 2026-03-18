import { useStore } from "./store";
import { spawnParticles } from "./particles";

/** Called by admin button — starts the cinematic overlay animation */
export function triggerUnlockEffect(id: string, enigmaTitle: string) {
  const store = useStore.getState();
  if (!store.enigmas[id] || store.enigmas[id].unlocked || store.enigmas[id].solved) return;
  store.startUnlocking(id, enigmaTitle);
}

/** Called by UnlockOverlay when the animation reaches its climax — actually unlocks the card */
export function triggerUnlockReveal(id: string, enigmaTitle: string) {
  const store = useStore.getState();
  if (!store.enigmas[id] || store.enigmas[id].unlocked || store.enigmas[id].solved) return;

  store.unlock(id);
  store.showToast(`✦ « ${enigmaTitle} » déverrouillé !`);

  setTimeout(() => {
    const el = document.querySelector(`[data-card-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      const card = el.firstElementChild as HTMLElement | null;
      if (card) {
        card.style.animation = "unlock-flash 0.7s ease-out";
        card.addEventListener("animationend", () => {
          card.style.animation = "";
        }, { once: true });
      }

      const r = el.getBoundingClientRect();
      spawnParticles(r.left + r.width / 2, r.top + r.height / 2, 28, "#9b6dff");
    }
  }, 300);
}
