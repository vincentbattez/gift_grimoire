import type { RefObject } from "react";
import { spawnParticles } from "../../particles";
import { sndInkLetterReveal } from "../../audio";
import { getWordCells, type WordConfig } from "./ink-config";

export function playHitParticles(
  gridRef: RefObject<HTMLDivElement | null>,
  cellKey: string,
) {
  const el = gridRef.current?.querySelector<HTMLElement>(
    `[data-cell="${cellKey}"]`,
  );
  if (!el) return;
  const rect = el.getBoundingClientRect();
  spawnParticles(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    15,
    "#e8c96a",
  );
}

export function playWordRipple(
  gridRef: RefObject<HTMLDivElement | null>,
  word: WordConfig,
) {
  const cells = getWordCells(word);
  cells.forEach(([r, c], idx) => {
    setTimeout(() => {
      sndInkLetterReveal(idx);
      const el = gridRef.current?.querySelector<HTMLElement>(
        `[data-cell="${r},${c}"]`,
      );
      if (!el) return;
      el.style.animation = "ink-word-ripple 0.5s ease-out both";
      setTimeout(() => {
        el.style.animation = "";
      }, 600);
      const rect = el.getBoundingClientRect();
      spawnParticles(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        10,
        "#e8c96a",
      );
    }, idx * 60);
  });
}

export function playCelebration(
  gridRef: RefObject<HTMLDivElement | null>,
  letterMapKeys: Iterable<string>,
) {
  if (!gridRef.current) return;
  for (const key of letterMapKeys) {
    const el = gridRef.current.querySelector<HTMLElement>(
      `[data-cell="${key}"]`,
    );
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    spawnParticles(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      8,
      "#e8c96a",
    );
  }
}

export function playVictoryShimmer(
  gridRef: RefObject<HTMLDivElement | null>,
) {
  const cells = gridRef.current?.querySelectorAll<HTMLElement>("[data-cell]");
  cells?.forEach((el) => {
    const [r, c] = (el.dataset.cell ?? "0,0").split(",").map(Number);
    const delay = (r + c) * 50;
    setTimeout(() => {
      el.style.animation = "ink-victory-shimmer 0.6s ease-out both";
      setTimeout(() => {
        el.style.animation = "";
      }, 700);
    }, delay);
  });
}
