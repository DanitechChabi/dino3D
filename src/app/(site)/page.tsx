import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, Pin } from "lucide-react";
import { db } from "@/lib/db";
import { church, DAYS } from "@/content/site";
import { formatDay, serviceOccurrences } from "@/lib/time";
import { getSettings, mapDirections } from "@/lib/settings";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PastorPortrait } from "@/components/motion/PastorPortrait";
import { formatActivityDate } from "@/content/activities";
import { getActivities } from "@/lib/content";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { MinistryIcon } from "@/components/MinistryIcon";
import { ChurchStats } from "@/components/ChurchStats";
import { DateBlock } from "@/components/events/DateBlock";
import { ProgressBar } from "@/components/solidarity/Progress";
import { VideoPlayer } from "@/components/live/VideoPlayer";
import { caseTotals } from "@/lib/solidarity";
import { WhatsappChannelButton } from "@/components/WhatsappChannelButton";

export default async function HomePage() {
  const [services, ministries, announcements, upcomingEvents, openCases, lastSermon, settings] = await Promise.all([
    db.service.findMany({ where: { ministryId: null }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    db.ministry.findMany({ orderBy: { order: "asc" } }),
    db.announcement.findMany({ where: { published: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 3 }),
    db.event.findMany({ where: { published: true, startAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, take: 3 }),
    db.solidarityCase.findMany({ where: { status: "OPEN", visibility: { not: "MEMBERS" } }, orderBy: { reviewedAt: "desc" }, take: 2 }),
    db.livestream.findFirst({ where: { status: "ENDED", published: true, url: { not: null } }, orderBy: { scheduledAt: "desc" } }),
    getSettings(),
  ]);
  const caseSums = await caseTotals(openCases.map((c) => c.id));

  const week = serviceOccurrences(services, new Date(), 6);
  const activities = await getActivities();
  const photos = activities.flatMap((a) => a.photos.map((p) => ({ ...p, slug: a.slug }))).slice(0, 8);
  // Rendez-vous de chaque semaine, affichés dès l'ouverture
  const weekly = services.filter((s) => s.weeks.length === 0);
  const directions = mapDirections(settings);

  return (
    <>
      {/* Ouverture : l'assemblée réunie */}
      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden bg-night-950">
        <Image
          src="/galerie/conference-couple-2026/conference-02.jpg"
          alt="L'assemblée de l'EBB-JR réunie au temple de Tanmey"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/45" />
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-night-950/70 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-32 sm:pb-14">
          <Reveal y={16}>
            <p className="text-sm font-semibold text-gold-300">{church.city}, Bénin · depuis {church.foundedYear}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[1.02] text-white">{church.name}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Une famille qui prie, chante et étudie la Parole de Dieu ensemble. Vous êtes le bienvenu, tel que vous êtes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/cultes">Horaires des cultes</MagneticButton>
              <MagneticButton href="/contact" variant="ghost">Nous contacter</MagneticButton>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {weekly.slice(0, 3).map((s) => (
              <div key={s.id} className="bg-night-950/80 px-5 py-4">
                <p className="text-sm text-white/60">{DAYS[s.dayOfWeek]}</p>
                <p className="mt-0.5 font-semibold text-white">
                  <span className="text-gold-300">{s.startTime.replace(":", "h")}</span> · {s.name}
                </p>
              </div>
            ))}
            <div className="bg-night-950/80 px-5 py-4">
              <p className="text-sm text-white/60">Adresse</p>
              {directions ? (
                <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1.5 font-semibold text-white hover:text-gold-200">
                  <MapPin className="size-4 shrink-0 text-gold-300" /> {settings.address}
                </a>
              ) : (
                <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-white"><MapPin className="size-4 shrink-0 text-gold-300" /> {settings.address}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mot du pasteur */}
      <section id="bienvenue" className="bg-ivory py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <PastorPortrait name={church.pastor.name} />
          </Reveal>
          <div>
            <SectionTitle eyebrow="Mot de bienvenue" title="Une famille qui vous attend" />
            <Reveal>
              <p className="text-xl leading-relaxed text-night-800">{church.pastor.welcome}</p>
              <p className="mt-6 font-semibold text-night-900">{church.pastor.name}</p>
              <p className="text-sm text-night-800/65">{church.pastor.title}</p>
              <Link href="/a-propos" className="mt-6 inline-flex items-center gap-1 font-bold text-gold-600 hover:text-gold-500">
                Notre histoire <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-6xl border-t border-night-900/10 px-4 pt-10">
          <ChurchStats ministries={ministries.length} />
        </div>
      </section>

      {/* Programme des prochains jours */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Cette semaine" title="Venez adorer avec nous" />
            <Link href="/cultes" className="mb-10 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
              Programme complet <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="divide-y divide-night-900/10 rounded-2xl border border-night-900/10 bg-white">
            {week.map(({ service: s, startAt, day }) => (
              <li key={s.id + day} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4">
                <p className="w-full text-sm capitalize text-night-800/65 sm:w-44">{formatDay(startAt, false)}</p>
                <p className="w-16 font-serif text-2xl font-semibold text-night-900">{s.startTime.replace(":", "h")}</p>
                <p className="min-w-0 flex-1 font-semibold text-night-900">{s.name}</p>
                <p className="flex w-full items-center gap-1 whitespace-nowrap pl-20 text-sm text-night-800/60 sm:w-auto sm:pl-0">
                  <Clock className="size-3.5" />
                  {s.endTime ? `jusqu'à ${s.endTime.replace(":", "h")}` : s.location}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {upcomingEvents.length > 0 && (
        <section className="bg-ivory py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Agenda" title="Prochains événements" />
              <Link href="/evenements" className="mb-10 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
                Tout l&apos;agenda <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {upcomingEvents.map((e) => (
                <Link key={e.id} href={`/evenements/${e.slug}`} className="block h-full">
                  <TiltCard className="flex h-full gap-4 rounded-2xl border border-night-900/10 bg-white p-5">
                    <DateBlock date={e.startAt} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gold-600">{e.category}</p>
                      <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-night-900">{e.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-night-800/70">{e.summary}</p>
                    </div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* La vie de l'église en images */}
      <section className="bg-ivory py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="La vie de l'église" title="Nos dernières activités" />
            <Link href="/blog" className="mb-10 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
              Tout le blog <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {activities.slice(0, 2).map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-night-950">
                  <Image src={a.photos[a.cover].src} alt={a.photos[a.cover].caption} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <p className="mt-4 text-sm font-semibold text-gold-600">
                  {a.category}
                  {a.date && <span className="font-normal text-night-800/60"> · {formatActivityDate(a.date)}</span>}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight text-night-900 group-hover:text-gold-600 sm:text-3xl">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-night-800/70">{a.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {photos.map((p) => (
              <Link key={p.src} href={`/galerie/${p.slug}`} className="relative aspect-square overflow-hidden rounded-lg bg-night-900/5">
                <Image src={p.src} alt={p.caption} fill sizes="(max-width: 640px) 25vw, 12vw" className="object-cover transition-opacity hover:opacity-85" />
              </Link>
            ))}
          </div>
          <Link href="/galerie" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
            Toute la galerie <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Dernière prédication */}
      {lastSermon?.url && (
        <section className="bg-night-950 py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1.3fr_1fr]">
            <VideoPlayer platform={lastSermon.platform} url={lastSermon.url} videoId={lastSermon.videoId} title={lastSermon.title} />
            <div>
              <SectionTitle dark eyebrow="Dernière prédication" title={lastSermon.title} text={[lastSermon.preacher, lastSermon.scripture].filter(Boolean).join(" · ") || undefined} />
              <div className="flex flex-wrap gap-3">
                <MagneticButton href="/predications">Toutes les prédications</MagneticButton>
                <MagneticButton href="/direct" variant="ghost">En direct</MagneticButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ministères */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Nos ministères" title="Chacun a sa place pour servir" text="« Que chacun de vous mette au service des autres le don qu'il a reçu. » — 1 Pierre 4:10" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((m) => (
              <Link key={m.id} href={`/ministeres/${m.slug}`} className="block h-full">
                <TiltCard className="flex h-full gap-4 rounded-2xl border border-night-900/10 bg-white p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-night-900 text-gold-300">
                    <MinistryIcon name={m.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-serif text-xl font-semibold text-night-900 group-hover:text-gold-600">{m.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-night-800/70">{m.summary}</span>
                  </span>
                </TiltCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Solidarité */}
      {openCases.length > 0 && (
        <section className="bg-ivory py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Solidarité" title="Portons ensemble les fardeaux" text="« Portez les fardeaux les uns des autres. » — Galates 6:2" />
              <Link href="/solidarite" className="mb-10 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
                Toutes les collectes <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {openCases.map((c) => (
                <Link key={c.id} href={`/solidarite/${c.slug}`} className="block h-full">
                  <TiltCard className="h-full rounded-2xl border border-night-900/10 bg-white p-6">
                    <span className="text-sm font-semibold text-gold-600">{c.reason}</span>
                    <h3 className="mt-1 font-serif text-2xl font-semibold text-night-900">{c.title}</h3>
                    <div className="mt-5"><ProgressBar raised={caseSums.get(c.id)?.raised ?? 0} goal={c.goal} /></div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Annonces */}
      {announcements.length > 0 && (
        <section className="bg-ivory py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Vie de l'église" title="Dernières annonces" />
              <Link href="/annonces" className="mb-10 inline-flex items-center gap-1 text-sm font-bold text-gold-600 hover:text-gold-500">
                Toutes les annonces <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {announcements.map((a) => (
                <article key={a.id} className="h-full rounded-2xl border border-night-900/10 bg-white p-6">
                  <p className="flex items-center gap-2 text-sm text-night-800/60">
                    {a.pinned && <Pin className="size-3.5 text-gold-600" />}
                    {a.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-night-900">{a.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-night-800/75">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nous rendre visite */}
      <section className="bg-night-950 py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">Venez nous rendre visite</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
              Le culte a lieu chaque dimanche. Vous pouvez aussi nous confier un sujet de prière ou parler avec le pasteur.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/contact?priere=1">Demander la prière</MagneticButton>
              <MagneticButton href="/inscription" variant="ghost">Rejoindre la famille</MagneticButton>
            </div>
          </div>
          <div className="space-y-2 md:justify-self-end">
            <p className="text-sm text-white/60">Pour nous joindre</p>
            <a href={`tel:${church.phone.replace(/\s/g, "")}`} className="block font-serif text-3xl font-semibold hover:text-gold-200">{church.phone}</a>
            <div className="pt-3"><WhatsappChannelButton /></div>
          </div>
        </div>
      </section>
    </>
  );
}
