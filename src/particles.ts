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

export function spawnCelebration(cx: number, cy: number) {
  // Vague 1 : explosion dorée centrale
  spawnParticles(cx, cy, 60, "#e8c96a");

  // Vague 2 : 6 explosions en cercle autour de la carte
  const radius = 80;
  for (let i = 0; i < 6; i++) {
    const angle = ((Math.PI * 2) / 6) * i;
    const delay = 120 + i * 100;
    setTimeout(() => {
      const col = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      spawnParticles(
        cx + Math.cos(angle) * radius + Math.random() * 16 - 8,
        cy + Math.sin(angle) * radius + Math.random() * 16 - 8,
        20,
        col,
      );
    }, delay);
  }

  // Vague 3 : embers montantes (vy négatif = vers le haut)
  setTimeout(() => {
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: cx + Math.random() * 120 - 60,
        y: cy + Math.random() * 40 - 20,
        vx: Math.random() * 0.6 - 0.3,
        vy: -(Math.random() * 1.5 + 0.5),
        r: Math.random() * 2.5 + 0.8,
        life: 1,
        col: Math.random() > 0.5 ? "#e8c96a" : "#4ecca3",
      });
    }
  }, 400);

  // Vague 4 : explosion finale massive
  setTimeout(() => {
    spawnParticles(cx, cy, 70, "#4ecca3");
  }, 800);

  // Vague 5 : pluie de paillettes dorées
  setTimeout(() => {
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: cx + Math.random() * 160 - 80,
        y: cy - 60 - Math.random() * 40,
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.8 + 0.2,
        r: Math.random() * 2 + 0.5,
        life: 1,
        col: "#e8c96a",
      });
    }
  }, 1000);
}
