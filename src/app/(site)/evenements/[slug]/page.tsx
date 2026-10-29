import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, CalendarPlus, Clock, MapPin, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { parseProgram } from "@/lib/events";
import { formatDay, formatTime } from "@/lib/time";
import { googleCalendarUrl } from "@/lib/ics";
import { LightParticles } from "@/components/motion/LightParticles";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { EventCountdown } from "@/components/events/EventCountdown";
import { ProgramTimeline } from "@/components/events/ProgramTimeline";
import { RegistrationForm } from "@/components/events/RegistrationForm";
import { ShareButtons } from "@/components/ShareButtons";
import { NotifyButton } from "@/components/NotifyButton";

async function load(slug: string) {
  return db.event.findFirst({ where: { slug, published: true }, include: { registrations: { select: { guests: true } } } });
}

export async function generateMetadata(props: PageProps<"/evenements/[slug]">): Promise<Metadata> {
  const e = await load((await props.params).slug);
  return e ? { title: e.title, description: e.summary, openGraph: { title: e.title, description: e.summary, images: e.coverUrl ? [e.coverUrl] : undefined } } : {};
}

export default async function EventPage(props: PageProps<"/evenements/[slug]">) {
  const event = await load((await props.params).slug);
  if (!event) notFound();
  const user = await getCurrentUser();
  const program = parseProgram(event.program);
  const upcoming = event.startAt > new Date();
  const taken = event.registrations.reduce((n, r) => n + 1 + r.guests, 0);
  const remaining = event.capacity ? Math.max(0, event.capacity - taken) : null;
  const canRegister = event.registrationOpen && upcoming && remaining !== 0;

  return (
    <>
      <section className="relative overflow-hidden bg-night-950 pb-16 pt-36 text-white sm:pt-44">
        {event.coverUrl && <Image src={event.coverUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/70 via-night-950/60 to-night-950" />
        <LightParticles density={40} />
        <div className="relative mx-auto max-w-5xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">{event.category}</p>
          <SplitWords as="h1" text={event.title} className="mt-3 font-serif text-[clamp(2.3rem,6.5vw,4.5rem)] font-semibold leading-[1.03]" />
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/80">
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-gold-300" /> {formatDay(event.startAt)}</span>
            <span className="flex items-center gap-2"><Clock className="size-4 text-gold-300" /> {formatTime(event.startAt)}{event.endAt && ` – ${formatTime(event.endAt)}`}</span>
            <span className="flex items-center gap-2"><MapPin className="size-4 text-gold-300" /> {event.location}</span>
          </div>
          <div className="mt-8">
            <EventCountdown start={event.startAt.toISOString()} end={event.endAt?.toISOString()} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal>
              <p className="font-serif text-2xl leading-relaxed text-night-900">{event.summary}</p>
            </Reveal>
            {event.description.split(/\n{2,}/).map((p, i) => (
              <Reveal key={i}>
                <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-night-800/85">{p}</p>
              </Reveal>
            ))}

            {program.length > 0 && (
              <div className="mt-14">
                <h2 className="mb-8 font-serif text-3xl font-semibold text-night-900">Programme</h2>
                <ProgramTimeline items={program} />
              </div>
            )}

            {event.articleSlug && (
              <Reveal className="mt-12">
                <Link href={`/blog/${event.articleSlug}`} className="inline-flex items-center gap-2 rounded-full bg-night-950 px-6 py-3 font-bold text-gold-200">
                  <BookOpen className="size-4" /> Lire le récit et voir les photos
                </Link>
              </Reveal>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {canRegister ? (
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-semibold text-night-900"><Users className="size-5 text-gold-600" /> Inscription</h2>
                <RegistrationForm eventId={event.id} remaining={remaining} defaults={user ? { name: `${user.firstName} ${user.lastName}`, phone: user.phone } : undefined} />
              </div>
            ) : (
              event.registrationOpen && upcoming && <p className="rounded-3xl bg-red-50 p-5 font-semibold text-red-800">Complet : il n&apos;y a plus de places disponibles.</p>
            )}

            {upcoming && (
              <div className="rounded-3xl border border-night-900/10 bg-white p-6">
                <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Ne l&apos;oubliez pas</h2>
                <div className="flex flex-wrap gap-2">
                  <a href={`/evenements/${event.slug}/agenda.ics`} className="inline-flex items-center gap-2 rounded-full border border-night-900/15 px-4 py-2 text-sm font-bold text-night-900 hover:border-gold-400">
                    <CalendarPlus className="size-4" /> Mon agenda
                  </a>
                  <a
                    href={googleCalendarUrl({ title: event.title, start: event.startAt, end: event.endAt, description: event.summary, location: event.location })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-night-900/15 px-4 py-2 text-sm font-bold text-night-900 hover:border-gold-400"
                  >
                    <CalendarPlus className="size-4" /> Google Agenda
                  </a>
                </div>
                <div className="mt-5">
                  <NotifyButton />
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-night-900/10 bg-white p-6">
              <ShareButtons title={event.title} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
