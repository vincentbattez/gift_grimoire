import { useStore } from "./store";
import { sndUnlock } from "./audio";
import { spawnParticles } from "./particles";

export function triggerUnlockEffect(id: string, enigmaTitle: string) {
  const store = useStore.getState();
  if (!store.enigmas[id] || store.enigmas[id].unlocked || store.enigmas[id].solved) return;

  store.unlock(id);
  store.showToast(`✦ « ${enigmaTitle} » déverrouillé !`);
  sndUnlock();

  setTimeout(() => {
    const el = document.querySelector(`[data-card-id="${id}"]`);
    if (el) {
      // Auto-scroll vers la carte déverrouillée
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Animation d'apparition (unlock-flash)
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
