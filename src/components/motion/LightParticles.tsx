"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/** Poussière de lumière qui s'élève lentement (canvas, très léger). */
export function LightParticles({ density = 70, className }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; t: number };
    let ps: P[] = [];

    const spawn = (anywhere: boolean): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.35 + 0.12,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((density * w) / 1200) + 20;
      ps = Array.from({ length: count }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy;
        p.t += 0.02;
        p.x += p.vx + Math.sin(p.t) * 0.15;
        if (p.y < -10) Object.assign(p, spawn(false));
        const twinkle = p.a * (0.6 + 0.4 * Math.sin(p.t * 1.7));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255, 236, 180, ${twinkle})`);
        g.addColorStop(1, "rgba(255, 236, 180, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pause quand l'onglet est caché, pour économiser la batterie
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, reduce]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`} aria-hidden />;
}
