"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Expand } from "lucide-react";
import type { Photo } from "@/content/activities";
import { Lightbox } from "./Lightbox";

/**
 * Grille de photos (dans l'ordre de l'album) : chaque photo se dévoile par un rideau au défilement,
 * zoom lent au survol, légende qui glisse ; un clic ouvre la visionneuse.
 */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [state, setState] = useState<{ index: number | null; direction: number }>({ index: null, direction: 0 });

  const navigate = (delta: number) =>
    setState((s) => (s.index === null ? s : { index: (s.index + delta + photos.length) % photos.length, direction: delta }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            onClick={() => setState({ index: i, direction: 0 })}
            className="group relative block w-full overflow-hidden rounded-2xl bg-night-900 text-left"
            initial={{ clipPath: "inset(100% 0% 0% 0% round 1rem)", opacity: 0.4 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1rem)", opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1, delay: (i % 3) * 0.08, ease: [0.65, 0, 0.35, 1] }}
            aria-label={`Agrandir : ${p.caption}`}
          >
            <motion.div
              initial={{ scale: 1.25 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={p.src}
                alt={p.caption}
                width={p.width}
                height={p.height}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-[1.6s] ease-out group-hover:scale-110"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/85 via-night-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-gold-300/0 transition-all duration-500 group-hover:ring-2 group-hover:ring-gold-300/70" />
            <span className="absolute right-3 top-3 grid size-9 scale-75 place-items-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Expand className="size-4" />
            </span>
            <p className="absolute inset-x-0 bottom-0 translate-y-1 p-3 text-xs font-semibold leading-snug text-white/95 transition-transform duration-500 group-hover:translate-y-0 sm:p-4 sm:text-sm">
              {p.caption}
            </p>
          </motion.button>
        ))}
      </div>
      <Lightbox
        photos={photos}
        index={state.index}
        direction={state.direction}
        onClose={() => setState({ index: null, direction: 0 })}
        onNavigate={navigate}
      />
    </>
  );
}
