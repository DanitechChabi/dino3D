"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Images } from "lucide-react";
import type { Activity } from "@/content/activities";
import { formatActivityDate } from "@/content/activities";

/** Carte d'album : au survol, trois photos s'éventaillent derrière la couverture. */
export function AlbumCard({ activity, href }: { activity: Activity; href: string }) {
  const cover = activity.photos[activity.cover];
  const fan = activity.photos.filter((_, i) => i !== activity.cover).slice(0, 2);

  return (
    <Link href={href} className="group block">
      <motion.div className="relative aspect-[4/5]" initial="rest" whileHover="hover" animate="rest">
        {fan.map((p, i) => (
          <motion.div
            key={p.src}
            className="absolute inset-0 overflow-hidden rounded-3xl border-4 border-white shadow-xl"
            variants={{
              rest: { rotate: 0, x: 0, y: 0 },
              hover: { rotate: i ? 9 : -9, x: i ? 34 : -34, y: 6 },
            }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <Image src={p.src} alt="" fill sizes="(max-width: 640px) 90vw, 30vw" className="object-cover" />
          </motion.div>
        ))}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-3xl border-4 border-white shadow-2xl"
          variants={{ rest: { y: 0 }, hover: { y: -8 } }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <Image src={cover.src} alt={cover.caption} fill sizes="(max-width: 640px) 90vw, 30vw" className="object-cover transition-transform duration-[1.6s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/20 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-gold-300 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-night-950">
            {activity.category}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gold-200">
              <Images className="size-3.5" /> {activity.photos.length} photos
              {activity.date && <> · {formatActivityDate(activity.date)}</>}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight text-white">{activity.title}</h3>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
