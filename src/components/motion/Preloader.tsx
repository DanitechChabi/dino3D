"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dove } from "./Dove";
import { AnimatedLogo } from "./AnimatedLogo";
import { LightParticles } from "./LightParticles";

const DURATION = 4200;

/**
 * Écran d'ouverture, joué une fois par visite : une colombe traverse la nuit
 * avec son rameau d'olivier, puis le logo de l'église se dévoile à son arrivée.
 * Un clic ou une touche permet de passer l'animation.
 */
export function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ebb_intro") === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const done = () => {
      setShow(false);
      try {
        sessionStorage.setItem("ebb_intro", "1");
      } catch {}
    };
    const raf = requestAnimationFrame(() => setShow(true));
    const id = setTimeout(done, DURATION);
    window.addEventListener("keydown", done, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
      window.removeEventListener("keydown", done);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          onClick={() => {
            setShow(false);
            try {
              sessionStorage.setItem("ebb_intro", "1");
            } catch {}
          }}
          className="fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-night-950"
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(0% at 50% 45%)", transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,#16224d_0%,#070d24_60%,#04081a_100%)]" />
          <LightParticles density={50} />

          {/* La colombe traverse l'écran puis se pose dans le logo */}
          <div className="absolute left-1/2 top-[42%] z-10 w-28 -translate-x-1/2 -translate-y-1/2 sm:w-36">
          <motion.div
            initial={{ x: "-70vw", y: "30vh", rotate: -14, opacity: 0, scale: 0.8 }}
            animate={{
              x: ["-70vw", "-25vw", "-12vw", "-3vw"],
              y: ["30vh", "-8vh", "-4vh", "-6vh"],
              rotate: [-14, -6, 4, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.15, 1.1, 0.6],
            }}
            transition={{ duration: 2.2, times: [0, 0.45, 0.8, 1], ease: "easeInOut" }}
          >
            <Dove speed={0.45} className="w-full drop-shadow-[0_0_18px_rgba(241,216,143,.55)]" />
          </motion.div>
          </div>

          <div className="relative flex flex-col items-center px-6 text-center">
            <AnimatedLogo className="size-56 sm:size-72" delay={1.45} priority />
            <motion.p
              className="mt-8 font-serif text-2xl text-white sm:text-3xl"
              initial={{ opacity: 0, y: 12, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.04em" }}
              transition={{ duration: 1.2, delay: 2.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Jésus <span className="text-gold-sheen italic">Revient</span>
            </motion.p>
            <motion.p
              className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-300/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3.1 }}
            >
              Église Baptiste Biblique · Tanmey
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
