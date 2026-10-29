"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const color = useTransform(progress, range, ["#8b93b8", "#f8e7b5"]);
  const textShadow = useTransform(progress, range, ["0 0 0px rgba(241,216,143,0)", "0 0 24px rgba(241,216,143,.55)"]);
  return (
    <motion.span style={{ opacity, color, textShadow }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}

/** Les mots s'illuminent un à un au fil du défilement : la lumière gagne sur les ténèbres. */
export function ScrollLightText({ text, reference }: { text: string; reference: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <div ref={ref}>
      <p className="font-serif text-[clamp(1.7rem,4.6vw,3.6rem)] font-medium leading-[1.15]">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
      <motion.p
        style={{ opacity: useTransform(scrollYProgress, [0.85, 1], [0, 1]) }}
        className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-400"
      >
        {reference}
      </motion.p>
    </div>
  );
}
