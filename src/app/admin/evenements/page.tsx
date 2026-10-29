import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { eventFormOptions } from "@/lib/admin-events";
import { formatDay, formatTime } from "@/lib/time";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { EventForm } from "@/components/admin/EventForm";

export const metadata: Metadata = { title: "Événements" };

export default async function EventsAdmin() {
  await requireRole("RESPONSABLE");
  const now = new Date();
  const [events, options] = await Promise.all([
    db.event.findMany({ orderBy: { startAt: "desc" }, include: { registrations: { select: { guests: true } } } }),
    eventFormOptions(),
  ]);
  const upcoming = events.filter((e) => e.startAt >= now).reverse();
  const past = events.filter((e) => e.startAt < now);

  const Row = ({ e }: { e: (typeof events)[number] }) => {
    const people = e.registrations.reduce((n, r) => n + 1 + r.guests, 0);
    return (
      <li className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <Link href={`/admin/evenements/${e.id}`} className="font-serif text-xl font-semibold text-night-900 hover:text-gold-600">{e.title}</Link>
          <p className="text-sm text-night-800/60">
            {formatDay(e.startAt)} · {formatTime(e.startAt)} · {e.category}
            {!e.published && " · brouillon"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {e.registrationOpen && (
            <Link href={`/admin/evenements/${e.id}#inscrits`} className="inline-flex items-center gap-1.5 rounded-full bg-gold-300/30 px-3 py-1 font-bold text-night-900">
              <Users className="size-4" /> {people}{e.capacity ? ` / ${e.capacity}` : ""}
            </Link>
          )}
          <Link href={`/admin/evenements/${e.id}`} className="font-bold text-gold-600">Modifier</Link>
        </div>
      </li>
    );
  };

  return (
    <>
      <AdminTitle title="Événements" text="Conférences, conventions, cultes spéciaux… avec programme, inscriptions et rappels automatiques." />
      <Panel className="mb-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Nouvel événement</h2>
        <EventForm {...options} />
      </Panel>
      <Panel className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-night-900">À venir ({upcoming.length})</h2>
        {upcoming.length === 0 ? <p className="mt-3 text-sm text-night-800/60">Aucun événement à venir.</p> : <ul className="divide-y divide-night-900/5">{upcoming.map((e) => <Row key={e.id} e={e} />)}</ul>}
      </Panel>
      {past.length > 0 && (
        <Panel>
          <h2 className="font-serif text-2xl font-semibold text-night-900">Passés</h2>
          <ul className="divide-y divide-night-900/5">{past.map((e) => <Row key={e.id} e={e} />)}</ul>
        </Panel>
      )}
    </>
  );
}
