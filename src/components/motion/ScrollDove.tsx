"use client";

import { useRef, type ReactNode } from "react";
import { Dove } from "./Dove";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "motion/react";

const W = 1200;
const H = 400;
const PATH = "M -60 300 C 200 60, 420 380, 640 200 S 1000 60, 1260 160";

/** Une colombe (le Saint-Esprit) traverse la section le long d'une courbe, au rythme du défilement. */
export function ScrollDove({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const t = useTransform(p, [0.15, 0.85], [0, 1], { clamp: true });

  const left = useMotionValue("-10%");
  const top = useMotionValue("75%");
  const rotate = useMotionValue(0);

  useMotionValueEvent(t, "change", (v) => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const a = path.getPointAtLength(v * len);
    const b = path.getPointAtLength(Math.min(len, v * len + 4));
    left.set(`${(a.x / W) * 100}%`);
    top.set(`${(a.y / H) * 100}%`);
    rotate.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
  });

  return (
    <div ref={ref} className="relative overflow-hidden">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="doveTrail">
            <stop offset="0" stopColor="#d4a43c" stopOpacity="0" />
            <stop offset="1" stopColor="#d4a43c" stopOpacity=".6" />
          </linearGradient>
        </defs>
        <path ref={pathRef} d={PATH} fill="none" stroke="none" />
        <motion.path d={PATH} fill="none" stroke="url(#doveTrail)" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ pathLength: t }} />
      </svg>
      <motion.div style={{ left, top, rotate }} className="pointer-events-none absolute z-10 -ml-14 -mt-10 w-28" aria-hidden>
        <Dove className="w-full drop-shadow-[0_6px_14px_rgba(27,58,107,.25)]" />
      </motion.div>
      <div className="relative">{children}</div>
    </div>
  );
}
