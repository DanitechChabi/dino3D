"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import type { ProgramItem } from "@/lib/events";

/** Programme horaire : un fil doré se trace pendant qu'on fait défiler les étapes. */
export function ProgramTimeline({ items }: { items: ProgramItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <ol ref={ref} className="relative space-y-6 pl-24 sm:pl-28">
      <div className="absolute bottom-2 left-[4.7rem] top-2 w-px bg-night-900/10 sm:left-[5.7rem]" />
      <motion.div style={{ scaleY }} className="absolute bottom-2 left-[4.7rem] top-2 w-px origin-top bg-gradient-to-b from-gold-300 to-gold-600 sm:left-[5.7rem]" />
      {items.map((it, i) => (
        <motion.li
          key={i}
          className="relative"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <span className="absolute -left-24 top-0.5 w-16 text-right font-serif text-xl font-semibold tabular-nums text-gold-600 sm:-left-28 sm:w-20">{it.time.replace(":", "h")}</span>
          <span className="absolute -left-[1.6rem] top-2 size-3 rounded-full border-2 border-gold-500 bg-ivory sm:-left-[1.6rem]" />
          <p className="text-lg font-semibold text-night-900">{it.title}</p>
        </motion.li>
      ))}
    </ol>
  );
}
