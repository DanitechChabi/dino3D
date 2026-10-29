"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Photo } from "@/content/activities";

/** Deux rubans de photos qui défilent en sens contraires. */
export function PhotoMarquee({ photos, href }: { photos: Photo[]; href: string }) {
  const reduce = useReducedMotion();
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)];

  return (
    <div className="space-y-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, r) => (
        <motion.div
          key={r}
          className="flex w-max gap-4"
          animate={reduce ? undefined : { x: r ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ duration: 60 + r * 10, repeat: Infinity, ease: "linear" }}
        >
          {[...row, ...row].map((p, i) => (
            <Link
              key={i}
              href={href}
              className={`group relative h-44 shrink-0 overflow-hidden rounded-2xl sm:h-56 ${i % 2 ? "rotate-1" : "-rotate-1"}`}
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
              tabIndex={i < row.length ? 0 : -1}
            >
              <Image src={p.src} alt={i < row.length ? p.caption : ""} fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-night-950/0 transition-colors group-hover:bg-night-950/20" />
            </Link>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
