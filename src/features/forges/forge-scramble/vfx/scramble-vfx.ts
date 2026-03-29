/** Snapshot all letter card positions for FLIP animation */
export function snapPositions(container: HTMLDivElement): Map<number, DOMRect> {
  const snapshot = new Map<number, DOMRect>();

  container.querySelectorAll<HTMLElement>("[data-lid]").forEach((el) => {
    snapshot.set(Number(el.dataset.lid), el.getBoundingClientRect());
  });

  return snapshot;
}

/** FLIP animation — animate cards from previous to current position */
export function animateFlip(container: HTMLDivElement, snapshot: Map<number, DOMRect>): void {
  const cards = container.querySelectorAll<HTMLElement>("[data-lid]");

  cards.forEach((el) => {
    const id = Number(el.dataset.lid);
    const prev = snapshot.get(id);

    if (!prev) {
      return;
    }
    const curr = el.getBoundingClientRect();
    const dx = prev.left - curr.left;
    const dy = prev.top - curr.top;

    if (dx === 0 && dy === 0) {
      return;
    }

    el.style.transition = "none";
    el.style.transform = `translate(${String(dx)}px, ${String(dy)}px)`;
    el.getBoundingClientRect();
    el.style.transition = "transform 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    el.style.transform = "";

    const cleanup = (): void => {
      el.style.transition = "";
      el.removeEventListener("transitionend", cleanup);
    };
    el.addEventListener("transitionend", cleanup);
  });
}
