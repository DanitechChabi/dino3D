"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Fine barre dorée en haut de l'écran qui suit la lecture. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-gold-600 via-gold-300 to-gold-500" />;
}
