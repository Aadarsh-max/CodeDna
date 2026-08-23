import { useEffect, useRef } from "react";

const COLORS = ["#0E8C7E", "#0E8C7E", "#6D5FC4", "#6D5FC4", "#8B7FD6", "#5EEAD4", "#C98A2E"];
const LINK_DISTANCE = 130;

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;

    const buildParticles = () => {
      const area = width * height;
      const count = Math.min(70, Math.max(24, Math.floor(area / 26000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.4 + Math.random() * 2.2,
        vy: 0.15 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.15,
        drift: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.18 + Math.random() * 0.22,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(109, 95, 196, ${0.09 * (1 - dist / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const step = () => {
      particles.forEach((p) => {
        p.drift += 0.01;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.drift) * 0.12;
        if (p.y - p.r > height) {
          p.y = -p.r;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      });
      drawFrame();
      animationId = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      animationId = requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default ParticleField;