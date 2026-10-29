"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { gospelActs } from "@/content/site";

const icons: Record<string, React.ReactNode> = {
  // Soleil et terre : la création
  creation: (
    <>
      <circle cx="60" cy="52" r="18" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        // Arrondi pour que le rendu serveur et client soient identiques
        const r = (n: number) => Math.round(n * 100) / 100;
        return <line key={i} x1={r(60 + Math.cos(a) * 26)} y1={r(52 + Math.sin(a) * 26)} x2={r(60 + Math.cos(a) * 36)} y2={r(52 + Math.sin(a) * 36)} />;
      })}
      <path d="M8 100 Q35 80 60 96 T112 92" />
    </>
  ),
  // Croix sur la colline
  croix: (
    <>
      <path d="M54 14 H66 V40 H88 V52 H66 V96 H54 V52 H32 V40 H54 Z" />
      <path d="M6 108 Q60 80 114 108" />
    </>
  ),
  // Tombeau vide, pierre roulée
  resurrection: (
    <>
      <path d="M20 104 V64 A40 40 0 0 1 100 64 V104" />
      <path d="M44 104 V76 A16 16 0 0 1 76 76 V104" />
      <circle cx="98" cy="88" r="16" />
      <path d="M6 106 H114" />
    </>
  ),
  // Couronne au-dessus des nuées
  retour: (
    <>
      <path d="M30 50 L38 22 L50 40 L60 16 L70 40 L82 22 L90 50 Z" />
      <path d="M12 92 Q22 74 40 82 Q48 64 66 72 Q84 60 96 78 Q112 76 110 92 Z" />
    </>
  ),
};

function Act({ act, index }: { act: (typeof gospelActs)[number]; index: number }) {
  return (
    <article className="relative flex h-[68vh] w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-gold-300/20 bg-gradient-to-br from-night-800 to-night-950 p-7 sm:w-[46vw] sm:p-10 lg:w-[34vw]">
      <div className="absolute -right-10 -top-10 size-56 rounded-full bg-gold-400/10 blur-3xl" />
      <span className="font-serif text-7xl font-semibold text-gold-300/15 sm:text-8xl">0{index + 1}</span>
      <motion.svg
        viewBox="0 0 120 120"
        className="mx-auto h-32 w-32 sm:h-40 sm:w-40"
        fill="none"
        stroke="#f1d88f"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.6 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      >
        <motion.g style={{ filter: "drop-shadow(0 0 6px rgba(241,216,143,.7))" }}>{icons[act.key]}</motion.g>
      </motion.svg>
      <div>
        <h3 className="font-serif text-3xl font-semibold text-white sm:text-4xl">{act.title}</h3>
        <p className="mt-3 text-base leading-relaxed text-white/75">{act.text}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">{act.ref}</p>
      </div>
    </article>
  );
}

/** L'Évangile en quatre actes, en défilement horizontal épinglé. */
export function GospelJourney() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  const x = useTransform(smooth, [0, 1], ["4%", "-72%"]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative h-[320vh] bg-night-950" aria-label="Le message de l'Évangile">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 w-full max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Le message que nous annonçons</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-white sm:text-5xl">La Bonne Nouvelle en quatre actes</h2>
          <div className="mt-5 h-px w-full bg-white/10">
            <motion.div style={{ width: bar }} className="h-px bg-gradient-to-r from-gold-600 to-gold-200" />
          </div>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-4">
          {gospelActs.map((act, i) => (
            <Act key={act.key} act={act} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
