"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/** Grande image d'en-tête : zoom lent façon « Ken Burns » et parallaxe au défilement. */
export function CinematicHero({ src, alt, children }: { src: string; alt: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[78svh] items-end overflow-hidden bg-night-950">
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.25, filter: "blur(6px)" }}
          animate={{ scale: 1.05, filter: "blur(0px)" }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.08] }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
          >
            <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(212,164,60,.25),transparent)]" />
      <motion.div style={{ opacity: fade }} className="relative w-full">
        {children}
      </motion.div>
    </section>
  );
}
