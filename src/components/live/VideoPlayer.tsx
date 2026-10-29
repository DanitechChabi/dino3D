"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { embedUrl, thumbnailUrl } from "@/lib/video";
import { CrossGlyph } from "../motion/CrossGlyph";

/**
 * Lecteur léger : affiche une vignette et ne charge la vidéo qu'au clic
 * (économise le forfait mobile et accélère la page).
 */
export function VideoPlayer({
  platform,
  url,
  videoId,
  title,
  live = false,
}: {
  platform: "YOUTUBE" | "FACEBOOK";
  url: string;
  videoId: string | null;
  title: string;
  live?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = thumbnailUrl(videoId);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-night-950 shadow-[0_40px_100px_-40px_rgba(7,13,36,.9)] ring-1 ring-gold-300/20">
      {playing ? (
        <iframe
          src={embedUrl(platform, url, videoId)}
          title={title}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 size-full" aria-label={`Lire : ${title}`}>
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,#22326b,#04081a_70%)]">
              <CrossGlyph className="h-24 w-auto opacity-40" delay={0} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-night-950/20" />
          {live && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span className="size-2 animate-pulse rounded-full bg-white" /> En direct
            </span>
          )}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.span className="absolute inset-0 rounded-full bg-gold-300/50" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-night-950 shadow-2xl transition-transform group-hover:scale-110">
              <Play className="ml-1 size-8 fill-current" />
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-5 text-left font-serif text-xl text-white sm:text-2xl">{title}</span>
        </button>
      )}
    </div>
  );
}
