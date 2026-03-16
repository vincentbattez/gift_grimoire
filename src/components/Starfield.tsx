import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; phase: number; spd: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  col: string;
};

const particles: Particle[] = [];

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

export function Starfield() {
  const starRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const starCv = starRef.current!;
    const starCtx = starCv.getContext("2d")!;
    const partCv = particleRef.current!;
    const partCtx = partCv.getContext("2d")!;
    let stars: Star[] = [];

    function resize() {
      starCv.width = window.innerWidth;
      starCv.height = window.innerHeight;
      partCv.width = window.innerWidth;
      partCv.height = window.innerHeight;
      stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * starCv.width,
        y: Math.random() * starCv.height,
        r: Math.random() * 1.4 + 0.3,
        phase: Math.random() * Math.PI * 2,
        spd: Math.random() * 0.006 + 0.002,
      }));
    }

    function draw(t: number) {
      starCtx.clearRect(0, 0, starCv.width, starCv.height);
      partCtx.clearRect(0, 0, partCv.width, partCv.height);

      for (const s of stars) {
        const a = 0.2 + 0.8 * Math.abs(Math.sin(t * 0.001 * s.spd * 160 + s.phase));
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        starCtx.fillStyle = `rgba(210,190,255,${a})`;
        starCtx.fill();
      }

      let i = particles.length;
      while (i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.015;
        p.life -= 0.008;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const hex = Math.floor(p.life * 255)
          .toString(16)
          .padStart(2, "0");
        partCtx.beginPath();
        partCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        partCtx.fillStyle = p.col + hex;
        partCtx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <canvas
        ref={starRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      <canvas
        ref={particleRef}
        className="fixed inset-0 z-999 pointer-events-none"
      />
    </>
  );
}
