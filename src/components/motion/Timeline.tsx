"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Reveal } from "./Reveal";

type Item = { year: string; title: string; text: string };

/** Frise chronologique dont le fil de lumière se trace au défilement. */
export function Timeline({ items }: { items: Item[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl pl-10 sm:pl-0">
      <div className="absolute bottom-0 left-3 top-0 w-px bg-night-900/10 sm:left-1/2" />
      <motion.div style={{ scaleY }} className="absolute bottom-0 left-3 top-0 w-px origin-top bg-gradient-to-b from-gold-300 via-gold-500 to-gold-600 sm:left-1/2" />
      {items.map((item, i) => (
        <li key={i} className={`relative mb-14 last:mb-0 sm:w-1/2 ${i % 2 ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right"}`}>
          <span className={`absolute top-2 -left-[2.05rem] size-4 rounded-full border-2 border-gold-500 bg-ivory shadow-[0_0_0_6px_rgba(212,164,60,.15)] ${i % 2 ? "sm:-left-2" : "sm:left-auto sm:-right-2"}`} />
          <Reveal delay={0.05}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-600">{item.year}</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-night-900">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-night-800/75">{item.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
