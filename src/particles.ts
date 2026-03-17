export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  col: string;
};

export const particles: Particle[] = [];

export function spawnParticles(
  x: number,
  y: number,
  n = 22,
  col = "#9b6dff",
) {
  for (let i = 0; i < n; i++) {
    const a = ((Math.PI * 2) / n) * i + Math.random() * 0.6;
    const s = Math.random() * 1.2 + 0.4;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r: Math.random() * 3 + 1,
      life: 1,
      col,
    });
  }
}

const FIREWORK_COLORS = ["#4ecca3", "#9b6dff", "#e8c96a", "#ff6b8a", "#59c3ff"];

export function spawnFirework(cx: number, cy: number) {
  // Burst central immédiat
  spawnParticles(cx, cy, 40, "#4ecca3");

  // 4 explosions secondaires décalées autour du centre
  const offsets = [
    { dx: -60, dy: -40, delay: 150 },
    { dx: 55, dy: -50, delay: 300 },
    { dx: -40, dy: 45, delay: 450 },
    { dx: 50, dy: 35, delay: 600 },
  ];

  for (const { dx, dy, delay } of offsets) {
    setTimeout(() => {
      const col = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      spawnParticles(cx + dx + Math.random() * 20 - 10, cy + dy + Math.random() * 20 - 10, 25, col);
    }, delay);
  }

  // Dernière grosse explosion dorée
  setTimeout(() => {
    spawnParticles(cx, cy, 50, "#e8c96a");
  }, 800);
}
