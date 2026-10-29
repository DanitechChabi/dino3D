import Link from "next/link";
import { ArrowRight, Clock, MapPin, Pin } from "lucide-react";
import { db } from "@/lib/db";
import { church, lightVerse, DAYS } from "@/content/site";
import { Hero } from "@/components/motion/Hero";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollLightText } from "@/components/motion/ScrollLightText";
import { GospelJourney } from "@/components/motion/GospelJourney";
import { VerseMarquee } from "@/components/motion/VerseMarquee";
import { Countdown } from "@/components/motion/Countdown";
import { ScrollDove } from "@/components/motion/ScrollDove";
import { TiltCard } from "@/components/motion/TiltCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PastorPortrait } from "@/components/motion/PastorPortrait";
import { PhotoMarquee } from "@/components/gallery/PhotoMarquee";
import { sortedActivities, formatActivityDate } from "@/content/activities";
import Image from "next/image";
import { Lamp } from "@/components/motion/Lamp";
import { LightParticles } from "@/components/motion/LightParticles";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { MinistryIcon } from "@/components/MinistryIcon";
import { ChurchStats } from "@/components/ChurchStats";
import { WhatsappChannelButton } from "@/components/WhatsappChannelButton";

export default async function HomePage() {
  const [services, ministries, announcements] = await Promise.all([
    db.service.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    db.ministry.findMany({ orderBy: { order: "asc" } }),
    db.announcement.findMany({ where: { published: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 3 }),
  ]);

  return (
    <>
      <Hero />

      {/* Mot de bienvenue */}
      <section id="bienvenue" className="relative scroll-mt-20 overflow-hidden bg-ivory py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <PastorPortrait name={church.pastor.name} />
          <div>
            <SectionTitle eyebrow="Mot de bienvenue" title="Une famille qui vous attend" />
            <Reveal delay={0.1}>
              <p className="font-serif text-2xl italic leading-relaxed text-night-800">« {church.pastor.welcome} »</p>
              <p className="mt-6 font-semibold text-night-900">{church.pastor.name}</p>
              <p className="text-sm text-gold-600">{church.pastor.title}</p>
              <div className="mt-8">
                <MagneticButton href="/a-propos" variant="dark">
                  Notre histoire <ArrowRight className="ml-1 inline size-4" />
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="mx-auto mt-24 max-w-5xl border-t border-gold-500/25 px-4 pt-14">
          <ChurchStats ministries={ministries.length} />
        </div>
      </section>

      {/* La lumière dans les ténèbres */}
      <section className="relative overflow-hidden bg-night-950 py-32 sm:py-44">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl" />
        <LightParticles density={35} />
        <div className="relative mx-auto max-w-5xl px-4">
          <ScrollLightText text={lightVerse} reference="Jean 1:5, 9" />
        </div>
      </section>

      {/* Horaires et compte à rebours */}
      <section className="relative bg-ivory py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Cultes & réunions" title="Venez adorer avec nous" text="Chaque semaine, nous nous rassemblons pour louer Dieu, prier et écouter Sa Parole." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <TiltCard className="h-full rounded-3xl border border-night-900/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(7,13,36,.4)]">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-600">{DAYS[s.dayOfWeek]}</p>
                  <p className="mt-3 font-serif text-5xl font-semibold text-night-900">{s.startTime.replace(":", "h")}</p>
                  <h3 className="mt-3 text-lg font-bold text-night-900">{s.name}</h3>
                  {s.description && <p className="mt-1 text-sm leading-relaxed text-night-800/70">{s.description}</p>}
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-night-800/60">
                    <MapPin className="size-3.5" />
                    {s.location}
                    {s.endTime && (
                      <>
                        <Clock className="ml-2 size-3.5" /> jusqu&apos;à {s.endTime.replace(":", "h")}
                      </>
                    )}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <Reveal className="relative mt-12 overflow-hidden rounded-[2rem] bg-night-950 px-4 py-12 sm:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(212,164,60,.35),transparent)]" />
            <div className="relative">
              <Countdown slots={services.map(({ name, dayOfWeek, startTime }) => ({ name, dayOfWeek, startTime }))} />
            </div>
          </Reveal>
        </div>
      </section>

      <GospelJourney />

      {/* Ministères */}
      <section className="bg-parchment py-24 sm:py-32">
        <ScrollDove>
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle eyebrow="Nos ministères" title="Chacun a sa place pour servir" text="« Comme de bons dispensateurs des diverses grâces de Dieu, que chacun de vous mette au service des autres le don qu'il a reçu. » — 1 Pierre 4:10" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ministries.map((m, i) => (
                <Reveal key={m.id} delay={(i % 3) * 0.08}>
                  <Link href={`/ministeres/${m.slug}`} className="block h-full">
                    <TiltCard className="h-full rounded-3xl border border-gold-500/20 bg-white/80 p-7 backdrop-blur transition-shadow hover:shadow-[0_25px_60px_-30px_rgba(179,134,42,.6)]">
                      <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-night-800 to-night-950 text-gold-300 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                        <MinistryIcon name={m.icon} className="size-6" />
                      </span>
                      <h3 className="mt-5 font-serif text-2xl font-semibold text-night-900">{m.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-night-800/70">{m.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-gold-600">
                        Découvrir <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </TiltCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </ScrollDove>
      </section>

      <VerseMarquee />

      {/* La vie de l'église en images */}
      <section className="overflow-hidden bg-ivory py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="La vie de l'église" title="Nos dernières activités" />
            <Link href="/blog" className="mb-12 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
              Tout le blog <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {sortedActivities.slice(0, 2).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.1}>
                <Link href={`/blog/${a.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[2rem] bg-night-950">
                  <Image src={a.photos[a.cover].src} alt={a.photos[a.cover].caption} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-[2s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300">
                      {a.category}
                      {a.date && <span className="normal-case tracking-normal"> · {formatActivityDate(a.date)}</span>}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">{a.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-gold-200">
                      Lire le récit <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mt-14">
          <PhotoMarquee photos={sortedActivities.flatMap((a) => a.photos).slice(0, 16)} href="/galerie" />
        </div>
      </section>

      {/* Annonces */}
      {announcements.length > 0 && (
        <section className="bg-ivory py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Vie de l'église" title="Dernières annonces" />
              <Link href="/annonces" className="mb-12 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
                Toutes les annonces <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {announcements.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.08}>
                  <article className="h-full rounded-3xl border border-night-900/10 bg-white p-7">
                    <p className="flex items-center gap-2 text-xs font-semibold text-night-800/60">
                      {a.pinned && <Pin className="size-3.5 text-gold-600" />}
                      {a.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-night-900">{a.title}</h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-night-800/75">{a.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Appel : veillez */}
      <section className="relative overflow-hidden bg-night-950 py-28 text-center sm:py-36">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(248,210,106,.22),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-10 flex items-end justify-center gap-6 sm:gap-10">
            {[0, 0.5, 1, 0.3, 0.8].map((d, i) => (
              <Lamp key={i} delay={d} className={`${i === 2 ? "h-24 sm:h-28" : "h-16 sm:h-20"} w-auto ${i % 4 === 0 ? "hidden sm:block" : ""}`} />
            ))}
          </div>
          <SectionTitle dark center eyebrow="Matthieu 25:13" title="Veillez, car vous ne savez ni le jour, ni l'heure" text="Gardons nos lampes allumées. Venez nous rejoindre, confiez-nous un sujet de prière, ou prenez contact avec le pasteur." />
          <Reveal className="flex flex-wrap justify-center gap-3">
            <MagneticButton href="/contact?priere=1">Demander la prière</MagneticButton>
            <MagneticButton href="/inscription" variant="ghost">Rejoindre la famille</MagneticButton>
          </Reveal>
          <Reveal delay={0.15} className="mt-6 flex justify-center">
            <WhatsappChannelButton />
          </Reveal>
        </div>
      </section>
    </>
  );
}
