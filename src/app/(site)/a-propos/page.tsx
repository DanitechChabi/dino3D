import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { Timeline } from "@/components/motion/Timeline";
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
          <SectionTitle eyebrow={`Notre histoire depuis ${church.foundedYear}`} title="Ce que Dieu a fait au milieu de nous" text="« Jusqu'ici l'Éternel nous a secourus. » — 1 Samuel 7:12" />
          <Timeline items={history} />
          <div className="mt-16 border-t border-night-900/10 pt-10">
            <ChurchStats ministries={ministries} />
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
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionTitle dark eyebrow="Vision & mission" title={vision.vision} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {vision.mission.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.1}>
                <div className="h-full border-t border-white/15 pt-5">
                  <h3 className="font-serif text-2xl font-semibold text-gold-200">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="confession" className="bg-parchment py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle eyebrow="Confession de foi" title="Ce que nous croyons" text="Nous croyons et enseignons ce que la Bible enseigne." />
          <ol className="space-y-4">
            {confession.map((c, i) => (
              <Reveal key={c.title} delay={0.05}>
                <li className="flex gap-4 border-b border-night-900/10 pb-5">
                  <span className="pt-1 font-serif text-2xl font-semibold text-gold-600">{i + 1}.</span>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-night-900">{c.title}</h3>
                    <p className="mt-1 leading-relaxed text-night-800/75">{c.text}</p>
                    <p className="mt-2 text-sm font-semibold text-gold-600">{c.ref}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Nos serviteurs" title="Pasteurs & responsables" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Seuls les serviteurs dont le nom est connu sont affichés */}
            {team.filter((t) => !/compléter/i.test(t.name)).map((t) => (
              <Reveal key={t.name}>
                <figure>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-night-700 to-night-950">
                    {t.photo && <Image src={t.photo} alt={t.name} fill sizes="(max-width: 640px) 90vw, 25vw" className="object-cover object-top" />}
                  </div>
                  <figcaption className="mt-3">
                    <span className="block font-serif text-xl font-semibold text-night-900">{t.name}</span>
                    <span className="text-sm text-night-800/65">{t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
