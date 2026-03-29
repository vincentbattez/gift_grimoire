/** Shake animation — CSS animation reset trick */
export function playShake(el: HTMLElement): void {
  el.style.animation = "none";
  void el.offsetHeight;
  el.style.animation = "shake 0.5s ease";
}
