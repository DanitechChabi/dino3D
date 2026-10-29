"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";

export type CalendarItem = { id: string; title: string; day: string; time: string; kind: "event" | "service"; href: string; location: string };

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Calendrier mensuel animé : les mois glissent, les jours avec un événement brillent,
 * un clic sur un jour déroule son programme.
 */
export function EventCalendar({ items, today }: { items: CalendarItem[]; today: string }) {
  const [y0, m0] = today.split("-").map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1, dir: 0 });
  const [selected, setSelected] = useState<string>(today);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of items) map.set(it.day, [...(map.get(it.day) ?? []), it]);
    for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [items]);

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const offset = (first.getUTCDay() + 6) % 7; // semaine commençant le lundi
  const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const go = (dir: number) =>
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m + dir, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth(), dir };
    });

  const selectedItems = byDay.get(selected) ?? [];
  const selectedLabel = new Date(`${selected}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="overflow-hidden rounded-[2rem] border border-night-900/10 bg-white p-4 shadow-[0_30px_80px_-50px_rgba(7,13,36,.5)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => go(-1)} aria-label="Mois précédent" className="grid size-10 place-items-center rounded-full hover:bg-parchment">
            <ChevronLeft />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={`${view.y}-${view.m}`}
              initial={{ opacity: 0, y: view.dir >= 0 ? 12 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: view.dir >= 0 ? -12 : 12 }}
              className="font-serif text-2xl font-semibold text-night-900"
            >
              {MONTHS[view.m]} {view.y}
            </motion.h3>
          </AnimatePresence>
          <button onClick={() => go(1)} aria-label="Mois suivant" className="grid size-10 place-items-center rounded-full hover:bg-parchment">
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[0.65rem] font-bold uppercase tracking-wider text-night-800/50">
          {WEEK.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>

        <AnimatePresence mode="popLayout" initial={false} custom={view.dir}>
          <motion.div
            key={`${view.y}-${view.m}`}
            custom={view.dir}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 60 : d < 0 ? -60 : 0, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const k = key(view.y, view.m, d);
              const list = byDay.get(k) ?? [];
              const hasEvent = list.some((x) => x.kind === "event");
              const isToday = k === today;
              const isSel = k === selected;
              return (
                <button
                  key={k}
                  onClick={() => setSelected(k)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    isSel ? "bg-night-950 text-gold-200" : hasEvent ? "bg-gold-300/30 text-night-900 hover:bg-gold-300/50" : "text-night-800 hover:bg-parchment"
                  }`}
                >
                  {isToday && !isSel && <motion.span className="absolute inset-1 rounded-lg ring-2 ring-gold-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
                  {d}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {list.slice(0, 3).map((x) => (
                      <span key={x.id + x.time} className={`size-1.5 rounded-full ${x.kind === "event" ? "bg-gold-500" : isSel ? "bg-white/60" : "bg-[#2f7bd0]/60"}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-night-800/60">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold-500" /> Événement</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#2f7bd0]/60" /> Culte ou réunion</span>
        </div>
      </div>

      <div className="rounded-[2rem] bg-night-950 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Programme du jour</p>
        <AnimatePresence mode="wait">
          <motion.div key={selected} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <h3 className="mt-2 font-serif text-3xl font-semibold first-letter:uppercase">{selectedLabel}</h3>
            {selectedItems.length === 0 ? (
              <p className="mt-6 text-white/60">Aucun rendez-vous ce jour-là.</p>
            ) : (
              <ul className="mt-6 space-y-3">
                {selectedItems.map((it, i) => (
                  <motion.li key={it.id + it.time} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={it.href} className={`block rounded-2xl border p-4 transition hover:bg-white/5 ${it.kind === "event" ? "border-gold-400/50" : "border-white/10"}`}>
                      <p className="flex items-center gap-2 text-sm text-gold-300"><Clock className="size-4" /> {it.time.replace(":", "h")}</p>
                      <p className="mt-1 font-semibold">{it.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60"><MapPin className="size-3.5" /> {it.location}</p>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
