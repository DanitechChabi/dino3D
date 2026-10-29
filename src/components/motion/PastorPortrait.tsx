"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { LightParticles } from "./LightParticles";
import { AnimatedLogo } from "./AnimatedLogo";

/**
 * Portrait du pasteur dans une arche : la silhouette détourée s'élève dans la lumière,
 * avec un halo doré derrière et le sceau de l'église en médaillon.
 */
export function PastorPortrait({ name }: { name: string }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-300/50 to-transparent blur-2xl" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] border border-gold-400/40 bg-gradient-to-b from-night-700 to-night-950 shadow-2xl">
        <div className="absolute left-1/2 top-[38%] size-[85%] -translate-x-1/2 -translate-y-1/2">
          <div className="size-full animate-rays bg-[repeating-conic-gradient(from_0deg,rgba(255,240,200,.16)_0deg_4deg,transparent_4deg_16deg)] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        </div>
        <motion.div
          className="absolute left-1/2 top-[34%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/35 blur-3xl"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <LightParticles density={30} />
        <motion.div
          className="absolute inset-x-0 bottom-0 top-[8%]"
          initial={{ y: "18%", opacity: 0, filter: "blur(10px)" }}
          whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/brand/pasteur-chabi-bouko-youssouf.png"
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, 384px"
            className="object-contain object-bottom drop-shadow-[0_0_25px_rgba(241,216,143,.35)]"
          />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night-950 to-transparent" />
        <div className="pointer-events-none absolute inset-3 rounded-t-full rounded-b-[1.5rem] border border-gold-300/30" />
      </div>
      <div className="absolute -bottom-6 -right-3 sm:-right-8">
        <AnimatedLogo className="size-24 sm:size-28" delay={0.8} />
      </div>
    </div>
  );
}
