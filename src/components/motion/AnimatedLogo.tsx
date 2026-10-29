"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";

// Rayon intérieur de l'anneau bleu, en % du rayon total (mesuré sur le logo)
const INNER = 73;

/**
 * Logo EBB‑JR en motion design :
 * 1. l'anneau bleu se dévoile d'un balayage circulaire (le texte « s'écrit » autour du cercle),
 * 2. le cœur du logo (croix, Bible, colombe) s'ouvre depuis le centre,
 * 3. un reflet de lumière traverse le sceau, puis un halo respire doucement.
 */
export function AnimatedLogo({ className = "size-64", delay = 0, priority = false }: { className?: string; delay?: number; priority?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const sweep = useMotionValue(reduce ? 360 : 0);
  const open = useMotionValue(reduce ? INNER + 2 : 0);
  const shine = useMotionValue(reduce ? 160 : -60);

  useEffect(() => {
    if (reduce || !inView) return;
    const a = animate(sweep, 360, { duration: 2, delay, ease: [0.65, 0, 0.35, 1] });
    const b = animate(open, INNER + 2, { duration: 1.2, delay: delay + 0.5, ease: [0.22, 1, 0.36, 1] });
    const c = animate(shine, 160, { duration: 1.2, delay: delay + 2, ease: "easeInOut" });
    return () => [a, b, c].forEach((x) => x.stop());
  }, [reduce, inView, delay, sweep, open, shine]);

  const ringMask = useMotionTemplate`conic-gradient(from -90deg, #000 ${sweep}deg, transparent ${sweep}deg)`;
  const centerMask = useMotionTemplate`radial-gradient(circle, #000 ${open}%, transparent calc(${open}% + 3%))`;
  const shineBg = useMotionTemplate`linear-gradient(115deg, transparent calc(${shine}% - 18%), rgba(255,255,255,.75) ${shine}%, transparent calc(${shine}% + 18%))`;
  const ringOnly = `radial-gradient(circle, transparent ${INNER - 1}%, #000 ${INNER}%)`;

  const img = (
    <Image src="/brand/logo-ebb-jr.png" alt="" fill sizes="(max-width: 640px) 70vw, 420px" priority={priority} className="select-none object-contain" draggable={false} />
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label="Logo de l'Église Baptiste Biblique Jésus Revient (EBB‑JR)"
    >
      {/* Halo */}
      <motion.div
        className="absolute -inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(47,123,208,.45),rgba(241,216,143,.25)_45%,transparent_70%)] blur-2xl"
        initial={{ opacity: 0 }}
        animate={!inView ? undefined : reduce ? { opacity: 0.8 } : { opacity: [0, 0.9, 0.55, 0.9], scale: [0.9, 1.05, 1, 1.05] }}
        transition={{ duration: 6, delay: delay + 1.2, repeat: reduce ? 0 : Infinity, repeatType: "mirror" }}
      />
      {/* Anneau */}
      <div className="absolute inset-0" style={{ maskImage: ringOnly, WebkitMaskImage: ringOnly }}>
        <motion.div className="absolute inset-0" style={{ maskImage: ringMask, WebkitMaskImage: ringMask }}>
          {img}
        </motion.div>
      </div>
      {/* Cœur du logo */}
      <motion.div className="absolute inset-0" style={{ maskImage: centerMask, WebkitMaskImage: centerMask }}>
        {img}
      </motion.div>
      {/* Reflet */}
      <motion.div className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay" style={{ background: shineBg }} />
    </motion.div>
  );
}
