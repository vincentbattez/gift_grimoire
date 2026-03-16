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
    const s = Math.random() * 3 + 1;
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

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const c2 = cv.getContext("2d")!;
    let stars: Star[] = [];

    function resize() {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        r: Math.random() * 1.4 + 0.3,
        phase: Math.random() * Math.PI * 2,
        spd: Math.random() * 0.006 + 0.002,
      }));
    }

    function draw(t: number) {
      c2.clearRect(0, 0, cv.width, cv.height);

      for (const s of stars) {
        const a = 0.2 + 0.8 * Math.abs(Math.sin(t * 0.001 * s.spd * 160 + s.phase));
        c2.beginPath();
        c2.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        c2.fillStyle = `rgba(210,190,255,${a})`;
        c2.fill();
      }

      let i = particles.length;
      while (i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 0.024;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const hex = Math.floor(p.life * 255)
          .toString(16)
          .padStart(2, "0");
        c2.beginPath();
        c2.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        c2.fillStyle = p.col + hex;
        c2.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
