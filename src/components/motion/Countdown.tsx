"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Slot = { name: string; dayOfWeek: number; startTime: string };

function nextOccurrence(slots: Slot[], now: Date) {
  let best: { slot: Slot; at: Date } | null = null;
  for (const slot of slots) {
    const [h, m] = slot.startTime.split(":").map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    let diff = (slot.dayOfWeek - now.getDay() + 7) % 7;
    if (diff === 0 && at <= now) diff = 7;
    at.setDate(at.getDate() + diff);
    if (!best || at < best.at) best = { slot, at };
  }
  return best;
}

function Digit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-gold-300/30 bg-night-900/80 sm:h-20 sm:w-20">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            initial={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 grid place-items-center font-serif text-3xl font-semibold tabular-nums text-gold-200 sm:text-4xl"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
    </div>
  );
}

/** Compte à rebours jusqu'au prochain culte ou à la prochaine réunion. */
export function Countdown({ slots }: { slots: Slot[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  if (!slots.length) return null;
  const next = now ? nextOccurrence(slots, now) : null;
  const ms = next && now ? next.at.getTime() - now.getTime() : 0;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor(ms / 3_600_000) % 24;
  const m = Math.floor(ms / 60_000) % 60;
  const s = Math.floor(ms / 1000) % 60;

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Prochain rendez-vous</p>
      <p className="mt-2 min-h-9 font-serif text-2xl text-white sm:text-3xl">
        {next ? `${next.slot.name} · ${next.at.toLocaleDateString("fr-FR", { weekday: "long" })} à ${next.slot.startTime.replace(":", "h")}` : " "}
      </p>
      <div className="mt-6 flex gap-3 sm:gap-4">
        <Digit value={d} label="Jours" />
        <Digit value={h} label="Heures" />
        <Digit value={m} label="Minutes" />
        <Digit value={s} label="Secondes" />
      </div>
    </div>
  );
}
