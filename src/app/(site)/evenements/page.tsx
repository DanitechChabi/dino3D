import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, MapPin, Users } from "lucide-react";
import { db } from "@/lib/db";
import { churchParts, formatDay, serviceOccurrences } from "@/lib/time";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { EventCalendar, type CalendarItem } from "@/components/events/EventCalendar";
import { DateBlock } from "@/components/events/DateBlock";
import { NotifyButton } from "@/components/NotifyButton";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";

export const metadata: Metadata = { title: "Événements & agenda", description: "Programme des cultes, conférences, conventions et activités de l'EBB-JR de Tanmey." };

export default async function EventsPage() {
  const now = new Date();
  const [upcoming, past, services, allEvents] = await Promise.all([
    db.event.findMany({ where: { published: true, startAt: { gte: now } }, orderBy: { startAt: "asc" }, include: { _count: { select: { registrations: true } } } }),
    db.event.findMany({ where: { published: true, startAt: { lt: now } }, orderBy: { startAt: "desc" }, take: 6 }),
    db.service.findMany(),
    db.event.findMany({
      where: { published: true, startAt: { gte: new Date(now.getTime() - 120 * 86_400_000), lte: new Date(now.getTime() + 365 * 86_400_000) } },
      select: { id: true, slug: true, title: true, startAt: true, location: true },
    }),
  ]);

  // Cultes hebdomadaires sur ~4 mois en arrière et 12 mois en avant pour le calendrier
  const items: CalendarItem[] = [
    ...allEvents.map((e) => {
      const p = churchParts(e.startAt);
      return { id: e.id, title: e.title, day: p.day, time: p.time, kind: "event" as const, href: `/evenements/${e.slug}`, location: e.location };
    }),
    ...serviceOccurrences(services, new Date(now.getTime() - 120 * 86_400_000), 485).map((o) => ({
      id: o.service.id,
      title: o.service.name,
      day: o.day,
      time: o.service.startTime,
      kind: "service" as const,
      href: "/cultes",
      location: o.service.location,
    })),
  ];

  return (
    <>
      <PageHeader eyebrow="Agenda de l'église" title="Événements & programmes" subtitle="« Il y a un temps pour tout, un temps pour toute chose sous les cieux. » — Ecclésiaste 3:1" />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <EventCalendar items={items} today={churchParts(now).day} />
        </div>
      </section>

      {/* Rappels */}
      <section className="relative overflow-hidden bg-night-950 py-16 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Ne manquez plus rien</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Recevez les rappels sur votre téléphone</h2>
            <p className="mt-3 text-white/70">La veille et une heure avant chaque culte, réunion ou événement.</p>
            <div className="mt-6">
              <NotifyButton dark />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Ou dans votre agenda</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Synchronisez le calendrier</h2>
            <p className="mt-3 text-white/70">Tous nos rendez-vous s&apos;ajoutent à l&apos;agenda de votre téléphone et se mettent à jour automatiquement, avec une alarme intégrée.</p>
            <div className="mt-6">
              <CalendarSubscribe dark />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="À venir" title="Prochains événements" />
          {upcoming.length === 0 && (
            <p className="rounded-3xl border border-dashed border-gold-500/40 bg-white p-8 text-center text-night-800/70">
              Aucun événement programmé pour le moment. Les cultes et réunions habituels continuent chaque semaine.
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((e, i) => (
              <Reveal key={e.id} delay={(i % 2) * 0.08}>
                <Link href={`/evenements/${e.slug}`} className="block h-full">
                  <TiltCard className="flex h-full flex-col overflow-hidden rounded-3xl bg-night-950 text-white">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-night-700 to-night-950">
                      {e.coverUrl && <Image src={e.coverUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-80 transition-transform duration-[1.6s] group-hover:scale-110" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-night-950 to-transparent" />
                      <div className="absolute left-5 top-5"><DateBlock date={e.startAt} /></div>
                      <span className="absolute right-5 top-5 rounded-full bg-gold-300 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-night-950">{e.category}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-2xl font-semibold leading-tight">{e.title}</h3>
                      <p className="mt-1 text-sm text-gold-200">{formatDay(e.startAt)}</p>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">{e.summary}</p>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {e.location}</span>
                        {e.registrationOpen && (
                          <span className="flex items-center gap-1.5 rounded-full bg-gold-300/15 px-3 py-1 font-bold text-gold-200">
                            <Users className="size-3.5" /> Inscriptions ouvertes
                          </span>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>

          {past.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-6 font-serif text-3xl font-semibold text-night-900">Événements passés</h2>
              <ul className="divide-y divide-night-900/10 rounded-3xl border border-night-900/10 bg-white">
                {past.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-4 p-5">
                    <DateBlock date={e.startAt} />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl font-semibold text-night-900">{e.title}</p>
                      <p className="text-sm text-night-800/60">{formatDay(e.startAt)}</p>
                    </div>
                    {e.articleSlug ? (
                      <Link href={`/blog/${e.articleSlug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-600">
                        <BookOpen className="size-4" /> Lire le récit
                      </Link>
                    ) : (
                      <Link href={`/evenements/${e.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-gold-600">
                        Détails <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
