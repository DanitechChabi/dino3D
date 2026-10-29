import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Images } from "lucide-react";
import { sortedActivities, formatActivityDate } from "@/content/activities";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { WhatsappChannelButton } from "@/components/WhatsappChannelButton";

export const metadata: Metadata = { title: "Blog", description: "Les activités et la vie de l'Église Baptiste Biblique Jésus Revient de Tanmey." };

export default function BlogPage() {
  const [featured, ...rest] = sortedActivities;

  return (
    <>
      <PageHeader eyebrow="Blog" title="La vie de l'église" subtitle="Conférences, formations, cultes et moments fraternels : retrouvez nos activités en récits et en images." />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#25D366]/30 bg-white p-5 sm:p-6">
            <p className="max-w-xl text-night-800">
              <span className="font-serif text-2xl font-semibold text-night-900">Ne manquez aucune nouvelle.</span>
              <br />
              Annonces, activités et enseignements, directement sur votre téléphone.
            </p>
            <WhatsappChannelButton />
          </Reveal>
          {featured && (
            <Reveal>
              <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] bg-night-950 text-white lg:grid-cols-[1.25fr_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
                  <Image
                    src={featured.photos[featured.cover].src}
                    alt={featured.photos[featured.cover].caption}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-night-950/60" />
                  <span className="absolute left-5 top-5 rounded-full bg-gold-300 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-night-950">À la une</span>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">{featured.category}</p>
                  <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{featured.title}</h2>
                  {featured.date && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
                      <CalendarDays className="size-4" /> {formatActivityDate(featured.date)}
                    </p>
                  )}
                  <p className="mt-4 leading-relaxed text-white/75">{featured.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-bold text-gold-300">
                    Lire le récit <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 0.08}>
                <Link href={`/blog/${a.slug}`} className="block h-full">
                  <TiltCard className="flex h-full flex-col overflow-hidden rounded-3xl border border-night-900/10 bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image src={a.photos[a.cover].src} alt={a.photos[a.cover].caption} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.6s] group-hover:scale-110" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-night-900">{a.category}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-2xl font-semibold leading-tight text-night-900">{a.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-night-800/70">{a.excerpt}</p>
                      <p className="mt-4 flex items-center justify-between text-xs font-semibold text-night-800/60">
                        <span className="flex items-center gap-1"><Images className="size-3.5" /> {a.photos.length} photos</span>
                        <span className="inline-flex items-center gap-1 font-bold text-gold-600">Lire <ArrowRight className="size-3.5" /></span>
                      </p>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
