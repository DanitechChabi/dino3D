import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { DAYS, firstVisitFaq } from "@/content/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { Countdown } from "@/components/motion/Countdown";
import { Accordion } from "@/components/motion/Accordion";
import { NotifyButton } from "@/components/NotifyButton";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";

export const metadata: Metadata = { title: "Cultes & horaires" };

export default async function ServicesPage() {
  const services = await db.service.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] });
  // La semaine commence le dimanche, jour du Seigneur
  const byDay = DAYS.map((day, i) => ({ day, items: services.filter((s) => s.dayOfWeek === i) })).filter((d) => d.items.length);

  return (
    <>
      <PageHeader eyebrow="Cultes & horaires" title="Venez, adorons le Seigneur" subtitle="« Je suis dans la joie quand on me dit : Allons à la maison de l'Éternel ! » — Psaume 122:1" />

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle center eyebrow="Programme hebdomadaire" title="Nos rendez-vous de la semaine" />
          <div className="space-y-8">
            {byDay.map(({ day, items }, i) => (
              <Reveal key={day} delay={i * 0.05}>
                <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                  <h3 className="font-serif text-3xl font-semibold text-gold-600">{day}</h3>
                  <div className="space-y-3">
                    {items.map((s) => (
                      <div key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-night-900/10 bg-white p-5">
                        <p className="font-serif text-3xl font-semibold text-night-900">{s.startTime.replace(":", "h")}</p>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-night-900">{s.name}</p>
                          {s.description && <p className="text-sm text-night-800/70">{s.description}</p>}
                        </div>
                        <div className="text-xs text-night-800/60">
                          <p className="flex items-center gap-1"><MapPin className="size-3.5" />{s.location}</p>
                          {s.endTime && <p className="mt-1 flex items-center gap-1"><Clock className="size-3.5" />jusqu&apos;à {s.endTime.replace(":", "h")}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night-950 px-4 py-20">
        <Countdown slots={services.map(({ name, dayOfWeek, startTime }) => ({ name, dayOfWeek, startTime }))} />
        <div className="mx-auto mt-14 grid max-w-4xl gap-8 border-t border-white/10 pt-10 text-white md:grid-cols-2">
          <div>
            <p className="mb-3 font-serif text-2xl">Un rappel avant chaque culte</p>
            <NotifyButton dark />
          </div>
          <div>
            <p className="mb-3 font-serif text-2xl">Les horaires dans votre agenda</p>
            <CalendarSubscribe dark />
          </div>
        </div>
      </section>

      <section id="premiere-visite" className="bg-parchment py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle center eyebrow="Première visite" title="Que dois-je attendre ?" text="Vous venez pour la première fois ? Voici quelques réponses pour vous sentir chez vous." />
          <Accordion items={firstVisitFaq} />
        </div>
      </section>
    </>
  );
}
