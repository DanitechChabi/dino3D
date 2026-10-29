"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-gold-300/30 bg-white/5 backdrop-blur sm:h-16 sm:w-16">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 grid place-items-center font-serif text-2xl font-semibold tabular-nums text-gold-200 sm:text-3xl"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
    </div>
  );
}

/** Compte à rebours jusqu'au début d'un événement. */
export function EventCountdown({ start, end }: { start: string; end?: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  if (now === null) return <div className="h-20" />;

  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : s + 3 * 3600_000;
  if (now >= e) return <p className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/80">Événement terminé</p>;
  if (now >= s)
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
        <span className="size-2 animate-pulse rounded-full bg-white" /> En cours
      </p>
    );
  const ms = s - now;
  return (
    <div className="flex gap-2 sm:gap-3">
      <Unit value={Math.floor(ms / 86_400_000)} label="Jours" />
      <Unit value={Math.floor(ms / 3_600_000) % 24} label="Heures" />
      <Unit value={Math.floor(ms / 60_000) % 60} label="Min" />
      <Unit value={Math.floor(ms / 1000) % 60} label="Sec" />
    </div>
  );
}
