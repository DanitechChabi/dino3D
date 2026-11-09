import Image from "next/image";
import type { ReactNode } from "react";

/** Grande photo d'en-tête des récits, avec le titre par-dessus. */
export function CinematicHero({ src, alt, children }: { src: string; alt: string; children: ReactNode }) {
  return (
    <section className="relative flex min-h-[70svh] items-end overflow-hidden bg-night-950">
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/50 to-night-950/20" />
      <div className="relative w-full">{children}</div>
    </section>
  );
}
