import { formatTime } from "@/lib/time";
import { church } from "@/content/site";

/** Petit bloc calendrier « 12 NOV » pour les cartes d'événements. */
export function DateBlock({ date, dark = false }: { date: Date; dark?: boolean }) {
  const day = date.toLocaleDateString("fr-FR", { day: "numeric", timeZone: church.timeZone });
  const month = date.toLocaleDateString("fr-FR", { month: "short", timeZone: church.timeZone }).replace(".", "");
  return (
    <div className={`flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-2xl text-center shadow-lg ${dark ? "bg-white/10 text-white" : "bg-white text-night-900"}`}>
      <span className="w-full bg-gradient-to-br from-gold-400 to-gold-600 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-night-950">{month}</span>
      <span className="pt-1 font-serif text-3xl font-semibold leading-none">{day}</span>
      <span className={`pb-1.5 text-[0.65rem] font-semibold ${dark ? "text-white/60" : "text-night-800/60"}`}>{formatTime(date)}</span>
    </div>
  );
}
