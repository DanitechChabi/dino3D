"use client";

import { motion } from "motion/react";
import { LightParticles } from "../motion/LightParticles";
import { SplitWords } from "../motion/SplitWords";

/** En-tête des pages intérieures : ciel nocturne, rayons et titre révélé. */
export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-night-950 pb-20 pt-36 text-center sm:pb-28 sm:pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#22326b_0%,#070d24_60%,#04081a_100%)]" />
      <div className="absolute left-1/2 top-0 size-[140vmax] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_0%,transparent_50%)]">
        <div className="size-full animate-rays bg-[repeating-conic-gradient(from_0deg,rgba(255,240,200,.12)_0deg_3deg,transparent_3deg_14deg)]" />
      </div>
      <LightParticles density={40} />
      <div className="relative mx-auto max-w-3xl px-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400"
        >
          {eyebrow}
        </motion.p>
        <SplitWords as="h1" text={title} delay={0.15} className="mt-3 font-serif text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[1.02] text-white" />
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-ivory" />
    </section>
  );
}
