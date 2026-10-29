/** Nuée stylisée faite de halos superposés (aucune image nécessaire). */
export function Cloud({ className, tone = "light" }: { className?: string; tone?: "light" | "dusk" }) {
  const c = tone === "light" ? "255,250,240" : "190,180,215";
  return (
    <div className={`pointer-events-none absolute ${className ?? ""}`} aria-hidden>
      <div
        className="h-full w-full"
        style={{
          background: [
            `radial-gradient(40% 55% at 30% 60%, rgba(${c},.95) 0%, rgba(${c},.45) 45%, transparent 100%)`,
            `radial-gradient(35% 50% at 55% 45%, rgba(${c},.9) 0%, rgba(${c},.4) 45%, transparent 100%)`,
            `radial-gradient(30% 45% at 75% 62%, rgba(${c},.85) 0%, rgba(${c},.38) 45%, transparent 100%)`,
            `radial-gradient(50% 40% at 50% 80%, rgba(${c},.8) 0%, rgba(${c},.35) 45%, transparent 100%)`,
          ].join(","),
        }}
      />
    </div>
  );
}
