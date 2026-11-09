/** Affiché instantanément pendant le chargement d'une page. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="bg-night-950 pb-14 pt-32 sm:pb-20 sm:pt-40">
        <div className="mx-auto max-w-6xl space-y-4 px-4">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-14">
        {[80, 95, 70].map((w) => (
          <div key={w} className="h-5 animate-pulse rounded bg-night-900/8" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
