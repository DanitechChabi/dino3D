import { CrossGlyph } from "@/components/motion/CrossGlyph";

/** Affiché instantanément pendant le chargement d'une page. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="relative grid h-[46svh] min-h-80 place-items-center overflow-hidden bg-night-950">
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_100%,#2a2350_0%,#0b1433_55%,#04081a_100%)]" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-gold-300/30 blur-2xl" />
            <CrossGlyph className="h-16 w-auto" />
          </div>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-loading-bar rounded-full bg-gradient-to-r from-gold-300 to-gold-500" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-16">
        {[80, 95, 70].map((w) => (
          <div key={w} className="h-5 animate-pulse rounded-full bg-night-900/8" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
