export type Particle = {
  positionX: number;
  positionY: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  life: number;
  color: string;
};

export const particleList: Particle[] = [];

export function spawnParticles(centerX: number, centerY: number, particleCount = 22, color = "#9b6dff"): void {
  for (let i = 0; i < particleCount; i++) {
    const angle = ((Math.PI * 2) / particleCount) * i + Math.random() * 0.6;
    const speed = Math.random() * 1.2 + 0.4;

    particleList.push({
      positionX: centerX,
      positionY: centerY,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 1,
      life: 1,
      color,
    });
  }
}

const FIREWORK_COLOR_LIST = ["#4ecca3", "#9b6dff", "#e8c96a", "#ff6b8a", "#59c3ff"];

export function spawnCelebration(centerX: number, centerY: number): void {
  // Vague 1 : explosion dorée centrale
  spawnParticles(centerX, centerY, 60, "#e8c96a");

  // Vague 2 : 6 explosions en cercle autour de la carte
  const radius = 80;
  for (let i = 0; i < 6; i++) {
    const angle = ((Math.PI * 2) / 6) * i;
    const delay = 120 + i * 100;

    setTimeout(() => {
      const color = FIREWORK_COLOR_LIST[Math.floor(Math.random() * FIREWORK_COLOR_LIST.length)];

      spawnParticles(
        centerX + Math.cos(angle) * radius + Math.random() * 16 - 8,
        centerY + Math.sin(angle) * radius + Math.random() * 16 - 8,
        20,
        color,
      );
    }, delay);
  }

  // Vague 3 : embers montantes (vy négatif = vers le haut)
  setTimeout(() => {
    for (let i = 0; i < 30; i++) {
      particleList.push({
        positionX: centerX + Math.random() * 120 - 60,
        positionY: centerY + Math.random() * 40 - 20,
        velocityX: Math.random() * 0.6 - 0.3,
        velocityY: -(Math.random() * 1.5 + 0.5),
        radius: Math.random() * 2.5 + 0.8,
        life: 1,
        color: Math.random() > 0.5 ? "#e8c96a" : "#4ecca3",
      });
    }
  }, 400);

  // Vague 4 : explosion finale massive
  setTimeout(() => {
    spawnParticles(centerX, centerY, 70, "#4ecca3");
  }, 800);

  // Vague 5 : pluie de paillettes dorées
  setTimeout(() => {
    for (let i = 0; i < 25; i++) {
      particleList.push({
        positionX: centerX + Math.random() * 160 - 80,
        positionY: centerY - 60 - Math.random() * 40,
        velocityX: Math.random() * 0.4 - 0.2,
        velocityY: Math.random() * 0.8 + 0.2,
        radius: Math.random() * 2 + 0.5,
        life: 1,
        color: "#e8c96a",
      });
    }
  }, 1000);
}
