import { church } from "@/content/site";

/** Quelques repères sur l'église. */
export function ChurchStats({ ministries, dark = false }: { ministries: number; dark?: boolean }) {
  const years = new Date().getFullYear() - church.foundedYear;
  const stats = [
    { value: String(church.foundedYear), label: "Année de fondation" },
    { value: `${years} ans`, label: "au service de Tanmey" },
    { value: `~${church.activeMembers}`, label: "Membres actifs" },
    { value: String(ministries), label: "Ministères" },
  ];
  return (
    <dl className={`grid grid-cols-2 gap-y-8 lg:grid-cols-4 ${dark ? "text-white" : ""}`}>
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse px-2">
          <dt className={`text-sm ${dark ? "text-white/60" : "text-night-800/65"}`}>{s.label}</dt>
          <dd className={`font-serif text-4xl font-semibold tabular-nums ${dark ? "text-gold-300" : "text-night-900"}`}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
