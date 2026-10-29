"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Hand } from "lucide-react";
import type { Photo } from "@/content/activities";
import { Lightbox } from "./Lightbox";

// Positions « éparpillées » fixes (identiques côté serveur et navigateur)
const SPOTS = [
  { left: 3, top: 8, rotate: -8 },
  { left: 24, top: 2, rotate: 5 },
  { left: 46, top: 10, rotate: -3 },
  { left: 68, top: 3, rotate: 7 },
  { left: 8, top: 48, rotate: 6 },
  { left: 30, top: 42, rotate: -6 },
  { left: 52, top: 50, rotate: 4 },
  { left: 72, top: 44, rotate: -9 },
  { left: 40, top: 26, rotate: 2 },
];

/**
 * Table de souvenirs : des Polaroid éparpillés qui se « développent » (du sépia à la couleur)
 * en apparaissant, que l'on peut déplacer, et qui s'ouvrent en grand au clic.
 */
export function PolaroidWall({ photos }: { photos: Photo[] }) {
  const area = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const shown = photos.slice(0, SPOTS.length);
  const [order, setOrder] = useState(shown.map((_, i) => i));
  const [view, setView] = useState<{ index: number | null; direction: number }>({ index: null, direction: 0 });

  const toFront = (i: number) => setOrder((o) => [...o.filter((x) => x !== i), i]);

  return (
    <>
      <div ref={area} className="grain relative h-[30rem] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,#5b4128,#3a2816_70%)] shadow-inner sm:h-[36rem]">
        {shown.map((p, i) => {
          const spot = SPOTS[i];
          return (
            <motion.div
              key={p.src}
              drag
              dragConstraints={area}
              dragElastic={0.15}
              dragMomentum={false}
              onDragStart={() => {
                dragged.current = true;
                toFront(i);
              }}
              onPointerDown={() => {
                dragged.current = false;
              }}
              onTap={() => {
                if (!dragged.current) setView({ index: i, direction: 0 });
              }}
              initial={{ opacity: 0, y: -80, rotate: spot.rotate * 3, scale: 1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: spot.rotate, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: i * 0.12 }}
              whileHover={{ scale: 1.06, rotate: 0, zIndex: 50 }}
              whileDrag={{ scale: 1.1, rotate: 0, boxShadow: "0 30px 60px -10px rgba(0,0,0,.6)" }}
              style={{ left: `${spot.left}%`, top: `${spot.top}%`, zIndex: order.indexOf(i) + 1 }}
              className="absolute w-[7.5rem] cursor-grab touch-none bg-[#fbf8f1] p-1.5 pb-7 shadow-[0_15px_35px_-10px_rgba(0,0,0,.55)] active:cursor-grabbing sm:w-52 sm:p-3 sm:pb-12"
            >
              <div className="relative aspect-square overflow-hidden bg-night-900">
                <motion.div
                  className="absolute inset-0"
                  initial={{ filter: "sepia(1) brightness(1.7) contrast(.6)" }}
                  whileInView={{ filter: "sepia(0.12) brightness(1) contrast(1)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 3.2, delay: 0.6 + i * 0.12, ease: "easeOut" }}
                >
                  <Image src={p.src} alt={p.caption} fill sizes="208px" className="pointer-events-none select-none object-cover" draggable={false} />
                </motion.div>
              </div>
              <p className="absolute inset-x-2 bottom-1.5 truncate text-center font-serif text-[0.65rem] italic text-night-800 sm:bottom-3 sm:text-sm">{p.caption}</p>
            </motion.div>
          );
        })}
        <p className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Hand className="size-3.5" /> Déplacez les photos · touchez pour agrandir
        </p>
      </div>
      <Lightbox
        photos={shown}
        index={view.index}
        direction={view.direction}
        onClose={() => setView({ index: null, direction: 0 })}
        onNavigate={(d) => setView((v) => (v.index === null ? v : { index: (v.index + d + shown.length) % shown.length, direction: d }))}
      />
    </>
  );
}
