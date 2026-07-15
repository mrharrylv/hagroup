import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  colorIdx: number;
}

const COLORS = ['99, 102, 241', '139, 92, 246', '167, 139, 250', '129, 140, 248'];

export default function Antigravity() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const createParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 6000), 160);
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.35 - 0.1,
      size: Math.random() * 4.5 + 2,
      opacity: Math.random() * 0.5 + 0.15,
      colorIdx: Math.floor(Math.random() * COLORS.length),
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawScene = () => {
      const { w, h } = sizeRef.current;
      const particles = particlesRef.current;
      ctx.clearRect(0, 0, w, h);

      for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS[particle.colorIdx]}, ${particle.opacity})`;
        ctx.fill();
      }

      const connectionDist = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance >= connectionDist) continue;

          const alpha = 0.12 * (1 - distance / connectionDist);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      createParticles(w, h);
      if (reducedMotion) drawScene();
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      return () => window.removeEventListener('resize', resize);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const { w, h } = sizeRef.current;

      const mouse = mouseRef.current;
      const repelRadius = 200;
      const particles = particlesRef.current;

      for (const p of particles) {
        // Mouse repulsion (antigravity)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * 1.0;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Gentle upward drift (antigravity feel)
        p.vy -= 0.005;

        // Damping
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

      }

      drawScene();

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
    />
  );
}
