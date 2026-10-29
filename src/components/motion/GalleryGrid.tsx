"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { X } from "lucide-react";
import { CrossGlyph } from "./CrossGlyph";

type Item = { src?: string; title: string; category: string };

const tints = [
  "from-night-700 to-night-950",
  "from-[#4a3561] to-night-950",
  "from-[#5b4520] to-night-950",
  "from-night-600 to-[#2a1838]",
];

function Visual({ item, i }: { item: Item; i: number }) {
  if (item.src) return <Image src={item.src} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />;
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${tints[i % tints.length]}`}>
      <CrossGlyph className="h-16 w-auto opacity-40" delay={0} />
    </div>
  );
}

/** Galerie filtrable ; un clic ouvre la photo en grand avec une transition partagée. */
export function GalleryGrid({ items }: { items: Item[] }) {
  const categories = ["Tout", ...Array.from(new Set(items.map((i) => i.category)))];
  const [filter, setFilter] = useState("Tout");
  const [active, setActive] = useState<number | null>(null);
  const shown = items.map((item, i) => ({ item, i })).filter(({ item }) => filter === "Tout" || item.category === filter);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LayoutGroup>
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === c ? "text-gold-200" : "text-night-800 hover:text-night-950"}`}
          >
            {filter === c && <motion.span layoutId="gal-pill" className="absolute inset-0 rounded-full bg-night-900" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map(({ item, i }) => (
            <motion.button
              layout
              key={i}
              layoutId={`photo-${i}`}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden rounded-2xl text-left ${i % 4 === 0 ? "row-span-2 aspect-[3/4] sm:aspect-auto" : "aspect-square"}`}
            >
              <Visual item={item} i={i} />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 transition-transform duration-500 group-hover:translate-y-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-300">{item.category}</p>
                <p className="font-serif text-lg font-semibold text-white sm:text-xl">{item.title}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-night-950/90 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div layoutId={`photo-${active}`} className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <Visual item={items[active]} i={active} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950 p-6">
                <p className="font-serif text-3xl text-white">{items[active].title}</p>
              </div>
            </motion.div>
            <button aria-label="Fermer" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" onClick={() => setActive(null)}>
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
