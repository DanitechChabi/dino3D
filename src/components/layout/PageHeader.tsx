/** En-tête des pages intérieures : bandeau sombre, sobre. */
export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-night-950 pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold text-gold-400">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-serif text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] text-white">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
}
