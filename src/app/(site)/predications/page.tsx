import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { SermonCard } from "@/components/live/SermonCard";

export const metadata: Metadata = { title: "Prédications", description: "Les prédications et cultes de l'EBB-JR de Tanmey en vidéo." };

export default async function SermonsPage(props: PageProps<"/predications">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const serie = typeof sp.serie === "string" ? sp.serie : "";
  const predicateur = typeof sp.predicateur === "string" ? sp.predicateur : "";

  const base: Prisma.LivestreamWhereInput = { status: "ENDED", published: true, url: { not: null } };
  const where: Prisma.LivestreamWhereInput = {
    ...base,
    ...(serie ? { series: serie } : {}),
    ...(predicateur ? { preacher: predicateur } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { scripture: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [sermons, all] = await Promise.all([
    db.livestream.findMany({ where, orderBy: { scheduledAt: "desc" }, take: 60 }),
    db.livestream.findMany({ where: base, select: { series: true, preacher: true } }),
  ]);
  const series = [...new Set(all.map((s) => s.series).filter(Boolean))] as string[];
  const preachers = [...new Set(all.map((s) => s.preacher).filter(Boolean))] as string[];

  return (
    <>
      <PageHeader eyebrow="Médiathèque" title="Prédications" subtitle="« La foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ. » — Romains 10:17" />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <form className="mb-10 grid gap-3 rounded-3xl border border-night-900/10 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-night-800/40" />
              <input name="q" defaultValue={q} placeholder="Rechercher (titre, passage…)" className="field pl-10" />
            </label>
            <select name="serie" defaultValue={serie} className="field">
              <option value="">Toutes les séries</option>
              {series.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select name="predicateur" defaultValue={predicateur} className="field">
              <option value="">Tous les prédicateurs</option>
              {preachers.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button className="rounded-full bg-night-950 px-6 py-3 text-sm font-bold text-gold-200">Filtrer</button>
          </form>

          {sermons.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-gold-500/40 bg-white p-10 text-center text-night-800/70">
              {q || serie || predicateur ? "Aucune prédication ne correspond à votre recherche." : "Les prédications apparaîtront ici après chaque direct."}
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 0.06}>
                  <SermonCard sermon={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
