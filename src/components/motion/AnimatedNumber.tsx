"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString("fr-FR")) });
    return () => controls.stop();
  }, [inView, value]);
  return <span ref={ref}>0</span>;
}
