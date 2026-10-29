"use client";

import { motion, useReducedMotion } from "motion/react";
import { verses } from "@/content/site";

/** Bandeau de versets qui défile sans fin. */
export function VerseMarquee({ reverse = false }: { reverse?: boolean }) {
  const reduce = useReducedMotion();
  const items = [...verses, ...verses];
  return (
    <div className="relative overflow-hidden border-y border-gold-500/20 bg-night-900 py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex w-max gap-12"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        {items.map((v, i) => (
          <p key={i} className="flex items-center gap-12 whitespace-nowrap font-serif text-xl italic text-white/80">
            <span>
              « {v.text} » <span className="not-italic text-sm font-sans font-bold tracking-widest text-gold-400">{v.ref}</span>
            </span>
            <span className="text-gold-400" aria-hidden>✦</span>
          </p>
        ))}
      </motion.div>
    </div>
  );
}
