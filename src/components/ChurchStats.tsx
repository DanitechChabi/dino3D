import { church } from "@/content/site";
import { AnimatedNumber } from "./motion/AnimatedNumber";
import { Reveal } from "./motion/Reveal";

/** Chiffres clés de l'église, animés à l'apparition. */
export function ChurchStats({ ministries, dark = false }: { ministries: number; dark?: boolean }) {
  const years = new Date().getFullYear() - church.foundedYear;
  const stats = [
    { node: <AnimatedNumber value={church.foundedYear} from={1950} group={false} duration={2} />, label: "Année de fondation" },
    { node: <AnimatedNumber value={years} />, label: "Années de fidélité" },
    { node: <AnimatedNumber value={church.activeMembers} prefix="~" />, label: "Membres actifs" },
    { node: <AnimatedNumber value={ministries} />, label: "Ministères" },
  ];

  return (
    <div className={`grid grid-cols-2 gap-y-10 lg:grid-cols-4 ${dark ? "text-white" : ""}`}>
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.1} className={`px-4 text-center ${i % 2 ? "border-l" : ""} lg:border-l lg:first:border-l-0 ${dark ? "border-white/10" : "border-gold-500/25"}`}>
          <p className="text-gold-sheen font-serif text-5xl font-semibold tabular-nums sm:text-6xl">{s.node}</p>
          <p className={`mt-2 text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-white/60" : "text-night-800/60"}`}>{s.label}</p>
        </Reveal>
      ))}
    </div>
  );
}
