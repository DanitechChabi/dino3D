"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const variants = {
  gold: "bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 text-night-950 shadow-[0_10px_40px_-10px_rgba(212,164,60,.8)]",
  dark: "bg-night-900 text-gold-200 shadow-[0_10px_40px_-12px_rgba(7,13,36,.9)]",
  ghost: "border border-gold-300/50 text-gold-200 backdrop-blur-sm hover:bg-white/5",
  ghostDark: "border border-night-900/30 bg-white/40 text-night-900 backdrop-blur-sm",
};

/** Bouton attiré par le curseur, avec un reflet doré qui le traverse. */
export function MagneticButton({
  href,
  children,
  variant = "gold",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });

  return (
    <motion.div style={{ x, y }} className="inline-block">
      <Link
        ref={ref}
        href={href}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          x.set((e.clientX - r.left - r.width / 2) * 0.3);
          y.set((e.clientY - r.top - r.height / 2) * 0.4);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-transform active:scale-95 ${variants[variant]} ${className}`}
      >
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-md transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
        <span className="relative">{children}</span>
      </Link>
    </motion.div>
  );
}
