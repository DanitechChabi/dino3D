"use client";

import Image from "next/image";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/content/activities";

type Props = { photos: Photo[]; index: number | null; direction: number; onClose: () => void; onNavigate: (delta: number) => void };

/** Visionneuse plein écran : flèches, clavier (← → Échap) et glissé du doigt. */
export function Lightbox({ photos, index, direction, onClose, onNavigate }: Props) {
  const open = index !== null;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    },
    [onClose, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onKey]);

  const photo = open ? photos[index] : null;

  // Rendu dans <body> : un ancêtre animé (filtre de transition de page) piégerait sinon la position fixe
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-night-950/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal
          aria-label={photo.caption}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <span className="text-sm font-semibold tabular-nums">
              {index + 1} / {photos.length}
            </span>
            <button onClick={onClose} aria-label="Fermer" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden" onClick={onClose}>
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? "60%" : d < 0 ? "-60%" : 0, opacity: 0, scale: d === 0 ? 0.9 : 1 }),
                  center: { x: 0, opacity: 1, scale: 1 },
                  exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) onNavigate(1);
                  else if (info.offset.x > 80) onNavigate(-1);
                }}
                className="absolute inset-0 cursor-grab p-3 active:cursor-grabbing sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src={photo.src} alt={photo.caption} fill sizes="100vw" className="pointer-events-none select-none object-contain" priority />
              </motion.div>
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => (e.stopPropagation(), onNavigate(-1))}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-gold-400 hover:text-night-950 sm:grid"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={(e) => (e.stopPropagation(), onNavigate(1))}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-gold-400 hover:text-night-950 sm:grid"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          <motion.p
            key={`c-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-6 pt-3 text-center font-serif text-xl italic text-white sm:text-2xl"
          >
            {photo.caption}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
