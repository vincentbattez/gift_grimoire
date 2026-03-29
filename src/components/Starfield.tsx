import { useEffect, useRef } from "react";
import { particleList } from "@/particles";
import { randomVisual } from "@/utils/random";

type Star = {
  positionX: number;
  positionY: number;
  radius: number;
  phase: number;
  speed: number;
  velocityX: number;
  velocityY: number;
};

export function Starfield(): React.JSX.Element {
  const starRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const starCanvas = starRef.current;
    const particleCanvas = particleRef.current;

    if (!starCanvas || !particleCanvas) {
      return;
    }
    const starCanvasContext = starCanvas.getContext("2d");
    const particleCanvasContext = particleCanvas.getContext("2d");

    if (!starCanvasContext || !particleCanvasContext) {
      return;
    }
    let starList: Star[] = [];

    const starCanvasElement = starCanvas;
    const particleCanvasElement = particleCanvas;
    const starContext = starCanvasContext;
    const particleContext = particleCanvasContext;

    function resize(): void {
      starCanvasElement.width = window.innerWidth;
      starCanvasElement.height = window.innerHeight;
      particleCanvasElement.width = window.innerWidth;
      particleCanvasElement.height = window.innerHeight;

      starList = Array.from({ length: 180 }, () => {
        const angle = randomVisual() * Math.PI * 2;
        const speed = randomVisual() * 0.12 + 0.03;

        return {
          positionX: randomVisual() * starCanvasElement.width,
          positionY: randomVisual() * starCanvasElement.height,
          radius: randomVisual() * 1.6 + 0.3,
          phase: randomVisual() * Math.PI * 2,
          speed: randomVisual() * 0.02 + 0.008,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
        };
      });
    }

    function draw(t: number): void {
      starContext.clearRect(0, 0, starCanvasElement.width, starCanvasElement.height);
      particleContext.clearRect(0, 0, particleCanvasElement.width, particleCanvasElement.height);

      for (const star of starList) {
        // Déplacement avec wrap-around
        star.positionX += star.velocityX;
        star.positionY += star.velocityY;

        if (star.positionX < -2) {
          star.positionX = starCanvasElement.width + 2;
        } else if (star.positionX > starCanvasElement.width + 2) {
          star.positionX = -2;
        }

        if (star.positionY < -2) {
          star.positionY = starCanvasElement.height + 2;
        } else if (star.positionY > starCanvasElement.height + 2) {
          star.positionY = -2;
        }

        // Clignotement plus intense (min 0.05, amplitude complète)
        const flicker = Math.sin(t * 0.001 * star.speed * 400 + star.phase);
        const alpha = 0.05 + 0.95 * (flicker * flicker);

        // Glow subtil pour les grosses étoiles
        if (star.radius > 1) {
          starContext.beginPath();
          starContext.arc(star.positionX, star.positionY, star.radius * 3, 0, Math.PI * 2);
          starContext.fillStyle = `rgba(180,160,255,${String(alpha * 0.08)})`;
          starContext.fill();
        }

        starContext.beginPath();
        starContext.arc(star.positionX, star.positionY, star.radius, 0, Math.PI * 2);
        starContext.fillStyle = `rgba(210,190,255,${String(alpha)})`;
        starContext.fill();
      }

      let i = particleList.length;
      while (i--) {
        const particle = particleList[i];
        particle.positionX += particle.velocityX;
        particle.positionY += particle.velocityY;
        particle.velocityY += 0.015;
        particle.life -= 0.008;

        if (particle.life <= 0) {
          particleList.splice(i, 1);
          continue;
        }
        const hex = Math.floor(particle.life * 255)
          .toString(16)
          .padStart(2, "0");
        particleContext.beginPath();
        particleContext.arc(particle.positionX, particle.positionY, particle.radius * particle.life, 0, Math.PI * 2);
        particleContext.fillStyle = particle.color + hex;
        particleContext.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={starRef} className="pointer-events-none fixed inset-0 z-0" />
      <canvas ref={particleRef} className="pointer-events-none fixed inset-0 z-999" />
    </>
  );
}
