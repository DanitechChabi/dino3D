"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { formatXOF } from "@/lib/money";

// Couleur des barres validée (contraste ≥ 3:1 sur fond blanc) — or foncé de la charte.
const BAR = "#b3862a";

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (n >= 1000) return `${Math.round(n / 1000)} k`;
  return String(n);
}

function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

/** Colonnes mensuelles : une seule série (le titre la nomme), infobulle au survol, tableau en dessous. */
export function MonthlyColumns({ data }: { data: { key: string; label: string; total: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.total)));
  const ticks = [0, max / 2, max];
  const best = data.reduce((b, d, i) => (d.total > data[b].total ? i : b), 0);

  return (
    <div>
      <div className="relative h-56 pl-10">
        {/* Grille */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-10 border-t border-night-900/10" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="absolute -left-10 -translate-y-1/2 text-[0.65rem] tabular-nums text-night-800/50">{compact(t)}</span>
          </div>
        ))}
        <div className="absolute inset-x-10 bottom-0 top-0 flex items-end justify-between gap-0.5">
          {data.map((d, i) => (
            <div
              key={d.key}
              className="relative flex h-full flex-1 cursor-default items-end justify-center"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg bg-night-950 px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ bottom: `${(d.total / max) * 100}%` }}>
                  <span className="block text-white/60">{d.label}</span>
                  <span className="font-bold">{formatXOF(d.total)}</span>
                </div>
              )}
              {i === best && d.total > 0 && hover === null && (
                <span className="absolute text-[0.65rem] font-bold tabular-nums text-night-900" style={{ bottom: `calc(${(d.total / max) * 100}% + 4px)` }}>{compact(d.total)}</span>
              )}
              <motion.div
                className="w-full max-w-6 rounded-t"
                style={{ backgroundColor: BAR, height: `${(d.total / max) * 100}%`, transformOrigin: "bottom", opacity: hover === null || hover === i ? 1 : 0.45 }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-0.5 pl-10 pr-10 text-[0.6rem] text-night-800/60 sm:text-[0.65rem]">
        {data.map((d) => <span key={d.key} className="flex-1 text-center">{d.label.split(" ")[0]}</span>)}
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs font-bold text-gold-600">Voir le tableau</summary>
        <table className="mt-2 w-full text-left">
          <tbody className="divide-y divide-night-900/5">
            {data.map((d) => (
              <tr key={d.key}><td className="py-1 text-night-800/70">{d.label}</td><td className="py-1 text-right font-semibold tabular-nums">{formatXOF(d.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Barres horizontales triées : libellé à gauche, valeur au bout de la barre. */
export function BarList({ data }: { data: { label: string; total: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.total));
  const sum = data.reduce((n, d) => n + d.total, 0);

  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} className="relative">
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="text-night-800">{d.label}</span>
            <span className="font-semibold tabular-nums text-night-900">
              {formatXOF(d.total)}
              {hover === i && sum > 0 && <span className="ml-1.5 font-normal text-night-800/60">· {Math.round((d.total / sum) * 100)} %</span>}
            </span>
          </div>
          <div className="h-3 rounded-full bg-night-900/5">
            <motion.div
              className="h-3 rounded-r rounded-l-sm"
              style={{ backgroundColor: BAR, width: `${(d.total / max) * 100}%`, transformOrigin: "left", opacity: hover === null || hover === i ? 1 : 0.5 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
