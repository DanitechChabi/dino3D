"use client";

import { motion } from "motion/react";

/** Lampe à huile dont la flamme vacille — « Veillez donc » (Matthieu 25). */
export function Lamp({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="flame" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".45" stopColor="#f8d26a" />
          <stop offset="1" stopColor="#e07b1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8873f" />
          <stop offset="1" stopColor="#7a4a1c" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="56" cy="42" r="22" fill="#f8d26a"
        initial={{ opacity: 0.15, r: 20 }}
        animate={{ opacity: [0.15, 0.3, 0.18, 0.28, 0.15], r: [20, 24, 21, 23, 20] }}
        transition={{ duration: 2.4, repeat: Infinity, delay }}
        style={{ filter: "blur(8px)" }}
      />
      <motion.path
        d="M56 22 C62 32 64 40 56 50 C48 40 50 32 56 22 Z"
        fill="url(#flame)"
        animate={{ scaleY: [1, 1.12, 0.95, 1.08, 1], scaleX: [1, 0.92, 1.05, 0.95, 1], skewX: [0, 3, -2, 2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{ originX: "56px", originY: "50px", transformBox: "view-box" }}
      />
      <path d="M8 62 C8 52 30 50 46 54 L60 50 C64 50 64 56 60 58 L50 62 C50 74 36 78 26 76 C14 74 8 70 8 62 Z" fill="url(#clay)" />
      <ellipse cx="28" cy="58" rx="8" ry="2.5" fill="#3d240c" opacity=".6" />
      <path d="M8 62 C4 60 2 54 6 52" stroke="#7a4a1c" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
