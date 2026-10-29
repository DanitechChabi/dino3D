import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { Timeline } from "@/components/motion/Timeline";
import { TiltCard } from "@/components/motion/TiltCard";
import { CrossGlyph } from "@/components/motion/CrossGlyph";
import { church, confession, history, team, vision } from "@/content/site";
import { db } from "@/lib/db";
import { ChurchStats } from "@/components/ChurchStats";
import { PolaroidWall } from "@/components/gallery/PolaroidWall";
import { getActivity, wallPhotos } from "@/content/activities";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "À propos" };

export default async function AboutPage() {
  const ministries = await db.ministry.count();
  const souvenirs = getActivity("souvenirs");
  return (
    <>
      <PageHeader eyebrow="Qui sommes-nous" title="Une église fondée sur la Parole" subtitle="Notre histoire, notre foi et la vision que Dieu nous a confiée." />

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle center eyebrow={`Notre histoire depuis ${church.foundedYear}`} title="Ce que Dieu a fait au milieu de nous" text="« Jusqu'ici l'Éternel nous a secourus. » — 1 Samuel 7:12" />
          <Timeline items={history} />
          <div className="mx-auto mt-20 max-w-5xl rounded-[2rem] bg-night-950 px-4 py-12">
            <ChurchStats ministries={ministries} dark />
          </div>
        </div>
      </section>

      {souvenirs && (
        <section className="bg-parchment py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Archives" title="Nos souvenirs" text="Quelques images d'hier, témoins de la fidélité de Dieu au fil des années." />
              <Link href="/galerie/souvenirs" className="mb-12 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
                Tout l&apos;album ({souvenirs.photos.length} photos) <ArrowRight className="size-4" />
              </Link>
            </div>
            <PolaroidWall photos={wallPhotos(souvenirs)} />
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-night-950 py-24 text-white">
        <div className="pointer-events-none absolute -right-40 top-0 size-[40rem] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionTitle dark eyebrow="Vision & mission" title={vision.vision} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {vision.mission.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <span className="font-serif text-5xl text-gold-400/40">0{i + 1}</span>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-gold-200">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="confession" className="bg-parchment py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle center eyebrow="Confession de foi" title="Ce que nous croyons" text="Nous croyons et enseignons ce que la Bible enseigne." />
          <ol className="space-y-4">
            {confession.map((c, i) => (
              <Reveal key={c.title} delay={0.05}>
                <li className="group flex gap-5 rounded-3xl border border-gold-500/20 bg-white/70 p-6 transition hover:bg-white sm:p-8">
                  <span className="font-serif text-4xl font-semibold text-gold-500 transition-transform duration-500 group-hover:scale-110">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-night-900">{c.title}</h3>
                    <p className="mt-1 leading-relaxed text-night-800/75">{c.text}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{c.ref}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle center eyebrow="Nos serviteurs" title="Pasteurs & responsables" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <TiltCard className="rounded-3xl border border-night-900/10 bg-white p-4 text-center">
                  <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-night-700 to-night-950">
                    {t.photo ? (
                      <>
                        <div className="absolute left-1/2 top-1/3 size-40 -translate-x-1/2 rounded-full bg-gold-300/30 blur-2xl" />
                        <Image src={t.photo} alt={t.name} fill sizes="(max-width: 640px) 90vw, 25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                      </>
                    ) : (
                      <CrossGlyph className="h-20 w-auto opacity-80" delay={0.2 + i * 0.2} />
                    )}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-night-900">{t.name}</h3>
                  <p className="mb-2 text-sm text-gold-600">{t.role}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
