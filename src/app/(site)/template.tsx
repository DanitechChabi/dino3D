"use client";

import { motion } from "motion/react";

/** Transition douce entre les pages (fondu + légère montée ; pas de filtre, trop coûteux sur téléphone). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
