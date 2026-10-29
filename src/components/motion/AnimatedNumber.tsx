"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/** Nombre qui défile jusqu'à sa valeur quand il apparaît à l'écran. */
export function AnimatedNumber({
  value,
  from = 0,
  prefix = "",
  suffix = "",
  group = true,
  duration = 1.4,
}: {
  value: number;
  from?: number;
  prefix?: string;
  suffix?: string;
  group?: boolean; // séparateur de milliers (désactivé pour une année)
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const format = (v: number) => `${prefix}${group ? Math.round(v).toLocaleString("fr-FR") : Math.round(v)}${suffix}`;

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(from, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => (el.textContent = format(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, from]);

  return <span ref={ref}>{format(from)}</span>;
}
