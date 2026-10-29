"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

/** Pastille flottante « EN DIRECT », visible sur tout le site pendant un direct. */
export function LiveBadge({ title }: { title: string }) {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const show = !closed && pathname !== "/direct";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 1 }}
          className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
        >
          <div className="flex max-w-full items-center gap-2 rounded-full bg-night-950/95 py-2 pl-2 pr-2 shadow-2xl ring-1 ring-red-500/40 backdrop-blur">
            <Link href="/direct" className="flex min-w-0 items-center gap-3">
              <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                En direct
              </span>
              <span className="truncate text-sm font-semibold text-white">{title}</span>
              <span className="hidden shrink-0 text-sm font-bold text-gold-300 sm:inline">Regarder →</span>
            </Link>
            <button onClick={() => setClosed(true)} aria-label="Masquer" className="grid size-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
