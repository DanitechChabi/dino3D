"use client";

import { motion } from "motion/react";
import { formatXOF } from "@/lib/money";
import { AnimatedNumber } from "../motion/AnimatedNumber";

/** Barre de progression d'une collecte (se remplit à l'apparition). */
export function ProgressBar({ raised, goal, dark = false }: { raised: number; goal: number | null; dark?: boolean }) {
  const pct = goal ? Math.min(100, (raised / goal) * 100) : 0;
  return (
    <div>
      <div className={`h-2.5 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-night-900/10"}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
          initial={{ width: 0 }}
          whileInView={{ width: `${goal ? pct : 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className={`mt-2 flex justify-between text-xs font-semibold ${dark ? "text-white/70" : "text-night-800/70"}`}>
        <span>{formatXOF(raised)} collectés</span>
        {goal ? <span>{Math.round(pct)} % de {formatXOF(goal)}</span> : null}
      </p>
    </div>
  );
}

/** Grand anneau doré : part de l'objectif atteinte, avec le montant au centre. */
export function ProgressRing({ raised, goal, donors }: { raised: number; goal: number | null; donors: number }) {
  const pct = goal ? Math.min(1, raised / goal) : 1;
  const r = 88;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto size-56">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="12" />
        <motion.circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#ringGold)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8e7b5" />
            <stop offset="1" stopColor="#d4a43c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-serif text-3xl font-semibold text-white"><AnimatedNumber value={raised} suffix=" F" /></p>
          {goal ? <p className="text-xs text-white/60">sur {formatXOF(goal)}</p> : null}
          <p className="mt-1 text-xs font-bold text-gold-300">{donors} donateur{donors > 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
}
