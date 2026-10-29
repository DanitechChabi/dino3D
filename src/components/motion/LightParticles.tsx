"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/** Poussière de lumière qui s'élève lentement (canvas ; en pause hors de l'écran). */
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
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let visible = true;

    // Halo dessiné une seule fois, puis simplement recopié (bien plus léger qu'un dégradé par particule)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 236, 180, 1)");
    grad.addColorStop(1, "rgba(255, 236, 180, 0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);

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
      const count = Math.round((density * w) / 1200) + (w < 640 ? 12 : 20);
      ps = Array.from({ length: count }, () => spawn(true));
    };

    // Sur téléphone, 30 images/s suffisent pour une poussière aussi lente et soulagent le processeur
    const frameGap = window.innerWidth < 768 ? 1000 / 30 : 0;
    let lastDraw = 0;
    const tick = (now = performance.now()) => {
      if (frameGap && now - lastDraw < frameGap - 2) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const step = frameGap ? 2 : 1;
      lastDraw = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy * step;
        p.t += 0.02 * step;
        p.x += (p.vx + Math.sin(p.t) * 0.15) * step;
        if (p.y < -10) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.t * 1.7));
        const size = p.r * 8;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    start();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pause hors de l'écran ou quand l'onglet est caché, pour la fluidité et la batterie
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, reduce]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`} aria-hidden />;
}
