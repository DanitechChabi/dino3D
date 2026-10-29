import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { getActivities } from "@/lib/content";
import { recurrenceLabel } from "@/lib/recurrence";

export async function generateMetadata(props: PageProps<"/ministeres/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = await db.ministry.findUnique({ where: { slug } });
  return { title: m?.name ?? "Ministère" };
}

export default async function MinistryPage(props: PageProps<"/ministeres/[slug]">) {
  const { slug } = await props.params;
  const ministry = await db.ministry.findUnique({
    where: { slug },
    include: {
      members: { where: { isLeader: true }, include: { user: { select: { firstName: true, lastName: true } } } },
      services: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
  if (!ministry) notFound();
  const related = (await getActivities()).filter((a) => a.ministry === ministry.slug);

  return (
    <>
      <PageHeader eyebrow="Ministère" title={ministry.name} subtitle={ministry.summary} />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <p className="font-serif text-2xl leading-relaxed text-night-800">{ministry.description}</p>
          </Reveal>
          {ministry.members.length > 0 && (
            <Reveal delay={0.1} className="mt-10 rounded-3xl border border-gold-500/20 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-600">Responsable{ministry.members.length > 1 ? "s" : ""}</p>
              <p className="mt-2 font-serif text-2xl text-night-900">
                {ministry.members.map((m) => `${m.user.firstName} ${m.user.lastName}`).join(", ")}
              </p>
            </Reveal>
          )}
          {ministry.services.length > 0 && (
            <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-3xl bg-night-950 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Horaires</p>
              <ul className="mt-4 divide-y divide-white/10">
                {ministry.services.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                    <span>
                      <span className="block font-semibold">{s.name}</span>
                      <span className="text-sm text-white/60">{recurrenceLabel(s.dayOfWeek, s.weeks)}</span>
                    </span>
                    <span className="font-serif text-2xl text-gold-300">
                      {s.startTime.replace(":", "h")}
                      {s.endTime && ` – ${s.endTime.replace(":", "h")}`}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href={`/contact?sujet=${encodeURIComponent(`Ministère ${ministry.name}`)}`} variant="dark">
              Je veux servir dans ce ministère
            </MagneticButton>
            <Link href="/ministeres" className="inline-flex items-center gap-1 text-sm font-bold text-gold-600">
              <ArrowLeft className="size-4" /> Tous les ministères
            </Link>
          </Reveal>
        </div>
        {related.length > 0 && (
          <div className="mx-auto mt-20 max-w-6xl px-8 sm:px-12">
            <h2 className="mb-10 font-serif text-3xl font-semibold text-night-900">Nos activités</h2>
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <AlbumCard key={a.slug} activity={a} href={`/blog/${a.slug}`} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
