"use client";

import { motion } from "motion/react";

/**
 * Colombe portant un rameau d'olivier (inspirée du logo), ailes animées.
 * `flapping` : battement continu ; sinon ailes déployées, immobiles.
 */
export function Dove({ className = "", flapping = true, speed = 0.7 }: { className?: string; flapping?: boolean; speed?: number }) {
  const flap = (delay: number, low: number) =>
    flapping
      ? { animate: { scaleY: [1, low, 1] }, transition: { duration: speed, repeat: Infinity, ease: "easeInOut" as const, delay } }
      : {};

  return (
    <svg viewBox="0 0 130 90" className={className} aria-hidden>
      {/* Aile arrière */}
      <motion.g style={{ originX: "62px", originY: "48px", transformBox: "view-box" }} {...flap(0.06, -0.35)}>
        <path d="M62 48 C56 32 46 16 30 6 C34 20 38 32 46 44 Z" fill="#dbe8f7" stroke="#1b3a6b" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M54 40 C48 30 42 22 36 16 M50 44 C44 36 40 30 34 26" stroke="#2f7bd0" strokeWidth="1" fill="none" strokeLinecap="round" />
      </motion.g>

      {/* Corps */}
      <path
        d="M14 64 C18 58 22 54 26 52 C34 48 48 46 62 47 C72 40 84 32 96 32 C102 32 106 35 108 38 L116 40 L108 43 C104 50 96 54 86 56 C76 62 62 64 48 62 C40 66 30 70 18 72 C22 68 22 66 14 64 Z"
        fill="#ffffff"
        stroke="#1b3a6b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M26 58 C34 60 42 60 50 58" stroke="#2f7bd0" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="101" cy="37" r="1.6" fill="#1b3a6b" />

      {/* Rameau d'olivier */}
      <g>
        <path d="M112 42 C108 50 102 56 94 60" stroke="#5b8a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {[
          [109, 48, -35],
          [105, 53, 20],
          [101, 55, -50],
          [97, 59, 10],
          [114, 44, -70],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="4.2" ry="1.7" fill={i % 2 ? "#7fb23a" : "#94c447"} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>

      {/* Aile avant */}
      <motion.g style={{ originX: "70px", originY: "48px", transformBox: "view-box" }} {...flap(0, -0.55)}>
        <path d="M70 48 C70 30 66 14 58 2 C78 8 92 24 88 44 Z" fill="#ffffff" stroke="#1b3a6b" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M76 42 C76 30 72 20 66 12 M82 42 C82 32 80 24 74 16 M70 44 C68 34 66 26 62 18" stroke="#2f7bd0" strokeWidth="1" fill="none" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
