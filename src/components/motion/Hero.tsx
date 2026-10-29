"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ChevronDown } from "lucide-react";
import { LightParticles } from "./LightParticles";
import { CrossGlyph } from "./CrossGlyph";
import { Cloud } from "./Cloud";
import { MagneticButton } from "./MagneticButton";
import { church, heroVerse } from "@/content/site";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Scène d'ouverture : la nuit, une croix de lumière, des rayons de gloire,
 * et les nuées qui s'écartent au défilement — « il viendra sur les nuées ».
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });

  const cloudLeftX = useTransform(p, [0, 1], ["0%", "-55%"]);
  const cloudRightX = useTransform(p, [0, 1], ["0%", "55%"]);
  const cloudFrontY = useTransform(p, [0, 1], ["0%", "40%"]);
  const glowScale = useTransform(p, [0, 1], [1, 2.4]);
  const glowOpacity = useTransform(p, [0, 0.6], [0.7, 1]);
  const crossY = useTransform(p, [0, 1], ["0%", "-30%"]);
  const crossScale = useTransform(p, [0, 1], [1, 1.25]);
  const titleY = useTransform(p, [0, 1], ["0%", "60%"]);
  const titleOpacity = useTransform(p, [0, 0.55], [1, 0]);
  const whiteout = useTransform(p, [0.55, 1], [0, 0.85]);

  return (
    <section ref={ref} className="relative h-[175vh] bg-night-950">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Ciel nocturne et horizon de gloire */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,#3a2a5a_0%,#16224d_35%,#070d24_70%,#04081a_100%)]" />
        <motion.div
          style={{ scale: glowScale, opacity: glowOpacity }}
          className="absolute left-1/2 top-[30%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,236,180,.55)_0%,rgba(228,189,95,.25)_25%,rgba(228,189,95,0)_60%)]"
        />

        {/* Rayons de gloire */}
        {/* Le masque circulaire est porté par l'élément qui tourne : il est dessiné une fois puis seulement pivoté */}
        <div className="absolute left-1/2 top-[30%] size-[120vmax] -translate-x-1/2 -translate-y-1/2">
          <div className="size-full animate-rays rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,240,200,.16)_0deg_4deg,transparent_4deg_15deg)] [mask-image:radial-gradient(circle,black_0%,transparent_70%)] will-change-transform" />
        </div>

        <LightParticles density={70} />

        {/* Croix */}
        <motion.div style={{ y: crossY, scale: crossScale }} className="absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 sm:top-[30%]">
          <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-gold-300/30 blur-3xl" />
          <CrossGlyph className="h-[15vh] w-auto drop-shadow-[0_0_30px_rgba(241,216,143,.6)] sm:h-[22vh]" />
        </motion.div>

        {/* Nuées qui s'écartent */}
        <motion.div style={{ x: cloudLeftX }} className="absolute inset-0 will-change-transform">
          <Cloud className="-left-[15%] bottom-[2%] h-[45vh] w-[75vw] opacity-90" tone="dusk" />
          <Cloud className="-left-[25%] bottom-[-12%] h-[40vh] w-[80vw]" />
        </motion.div>
        <motion.div style={{ x: cloudRightX }} className="absolute inset-0 will-change-transform">
          <Cloud className="-right-[15%] bottom-[4%] h-[42vh] w-[70vw] opacity-90" tone="dusk" />
          <Cloud className="-right-[25%] bottom-[-14%] h-[42vh] w-[80vw]" />
        </motion.div>
        <motion.div style={{ y: cloudFrontY }} className="absolute inset-0 will-change-transform">
          <Cloud className="bottom-[-22%] left-[10%] h-[38vh] w-[80vw]" />
        </motion.div>

        {/* Titre */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-[16vh] text-center sm:pb-[14vh]"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.32em" }}
            transition={{ duration: 1.6, delay: 0.4, ease }}
            className="mb-3 text-[0.65rem] font-semibold uppercase text-gold-200 sm:text-xs"
          >
            Église Baptiste Biblique · {church.city}
          </motion.p>
          <h1 className="font-serif text-[clamp(3.2rem,11vw,9rem)] font-semibold leading-[0.9] text-white">
            {["Jésus", "Revient"].map((word, i) => (
              <span key={word} className="inline-block overflow-hidden px-[0.08em] pb-[0.08em] align-bottom">
                <motion.span
                  className={`inline-block ${i === 1 ? "text-gold-sheen italic" : ""}`}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1.3, delay: 1.1 + i * 0.25, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 2, ease }}
            className="mt-5 max-w-xl rounded-2xl bg-night-950/60 px-5 py-3 font-serif text-lg italic leading-snug text-white shadow-[0_10px_40px_-15px_rgba(4,8,26,.6)] sm:text-xl"
          >
            « {heroVerse.text} »
            <span className="mt-1 block font-sans text-xs font-semibold not-italic tracking-widest text-gold-200">{heroVerse.ref}</span>
          </motion.blockquote>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.4, ease }}
            className="mt-7 flex flex-wrap justify-center gap-3"
          >
            <MagneticButton href="/cultes" variant="dark">Nous rendre visite</MagneticButton>
            <MagneticButton href="/a-propos" variant="ghostDark">Découvrir l&apos;église</MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: whiteout }} className="pointer-events-none absolute inset-0 bg-ivory" />

        <Link
          href="#bienvenue"
          aria-label="Défiler vers le bas"
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-night-800/70"
        >
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="block">
            <ChevronDown className="size-6" />
          </motion.span>
        </Link>
      </div>
    </section>
  );
}
