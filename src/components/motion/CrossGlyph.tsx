"use client";

import { motion, type Variants } from "motion/react";

/** Croix qui se trace d'un seul trait puis s'illumine. */
export function CrossGlyph({ className, delay = 0.3 }: { className?: string; delay?: number }) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 2.2, ease: [0.65, 0, 0.35, 1] as const, delay }, opacity: { duration: 0.2, delay } } },
  };
  return (
    <motion.svg viewBox="0 0 120 180" className={className} initial="hidden" animate="show" aria-hidden>
      <defs>
        <linearGradient id="crossGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset=".5" stopColor="#f1d88f" />
          <stop offset="1" stopColor="#d4a43c" />
        </linearGradient>
        <filter id="crossGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M52 8 H68 V52 H108 V68 H68 V172 H52 V68 H12 V52 H52 Z"
        fill="none"
        stroke="url(#crossGold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#crossGlow)"
        variants={draw}
      />
      <motion.path
        d="M52 8 H68 V52 H108 V68 H68 V172 H52 V68 H12 V52 H52 Z"
        fill="url(#crossGold)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        transition={{ duration: 1.5, delay: delay + 2 }}
      />
    </motion.svg>
  );
}
