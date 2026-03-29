import { useEffect, useRef } from "react";
import { particles } from "../particles";

type Star = { x: number; y: number; r: number; phase: number; spd: number; vx: number; vy: number };

export function Starfield() {
  const starRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const starCv = starRef.current;
    const partCv = particleRef.current;

    if (!starCv || !partCv) {
      return;
    }
    const starCtx = starCv.getContext("2d");
    const partCtx = partCv.getContext("2d");

    if (!starCtx || !partCtx) {
      return;
    }
    let stars: Star[] = [];

    const sCv = starCv;
    const pCv = partCv;
    const sCtx = starCtx;
    const pCtx = partCtx;

    function resize() {
      sCv.width = window.innerWidth;
      sCv.height = window.innerHeight;
      pCv.width = window.innerWidth;
      pCv.height = window.innerHeight;

      stars = Array.from({ length: 180 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.12 + 0.03;

        return {
          x: Math.random() * sCv.width,
          y: Math.random() * sCv.height,
          r: Math.random() * 1.6 + 0.3,
          phase: Math.random() * Math.PI * 2,
          spd: Math.random() * 0.02 + 0.008,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        };
      });
    }

    function draw(t: number) {
      sCtx.clearRect(0, 0, sCv.width, sCv.height);
      pCtx.clearRect(0, 0, pCv.width, pCv.height);

      for (const s of stars) {
        // Déplacement avec wrap-around
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < -2) {
          s.x = sCv.width + 2;
        } else if (s.x > sCv.width + 2) {
          s.x = -2;
        }

        if (s.y < -2) {
          s.y = sCv.height + 2;
        } else if (s.y > sCv.height + 2) {
          s.y = -2;
        }

        // Clignotement plus intense (min 0.05, amplitude complète)
        const flicker = Math.sin(t * 0.001 * s.spd * 400 + s.phase);
        const a = 0.05 + 0.95 * (flicker * flicker);

        // Glow subtil pour les grosses étoiles
        if (s.r > 1) {
          sCtx.beginPath();
          sCtx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          sCtx.fillStyle = `rgba(180,160,255,${String(a * 0.08)})`;
          sCtx.fill();
        }

        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(210,190,255,${String(a)})`;
        sCtx.fill();
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
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        pCtx.fillStyle = p.col + hex;
        pCtx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={starRef} className="fixed inset-0 z-0 pointer-events-none" />
      <canvas ref={particleRef} className="fixed inset-0 z-999 pointer-events-none" />
    </>
  );
}
