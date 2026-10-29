import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { eventFormOptions } from "@/lib/admin-events";
import { parseProgram, programToText } from "@/lib/events";
import { toLocalInput } from "@/lib/time";
import { deleteEvent } from "@/actions/admin";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { EventForm } from "@/components/admin/EventForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Modifier l'événement" };

export default async function EditEvent(props: PageProps<"/admin/evenements/[id]">) {
  await requireRole("RESPONSABLE");
  const { id } = await props.params;
  const [event, options] = await Promise.all([
    db.event.findUnique({ where: { id }, include: { registrations: { orderBy: { createdAt: "asc" } } } }),
    eventFormOptions(),
  ]);
  if (!event) notFound();
  const people = event.registrations.reduce((n, r) => n + 1 + r.guests, 0);

  return (
    <>
      <Link href="/admin/evenements" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gold-600"><ArrowLeft className="size-4" /> Tous les événements</Link>
      <AdminTitle title={event.title}>
        <Link href={`/evenements/${event.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-bold text-night-900"><ExternalLink className="size-4" /> Voir la page</Link>
      </AdminTitle>
      <Panel className="mb-6">
        <EventForm
          {...options}
          event={{
            id: event.id,
            title: event.title,
            category: event.category,
            summary: event.summary,
            description: event.description,
            location: event.location,
            startAt: toLocalInput(event.startAt),
            endAt: event.endAt ? toLocalInput(event.endAt) : "",
            coverUrl: event.coverUrl ?? "",
            program: programToText(parseProgram(event.program)),
            capacity: event.capacity ? String(event.capacity) : "",
            ministryId: event.ministryId ?? "",
            articleSlug: event.articleSlug ?? "",
            registrationOpen: event.registrationOpen,
            published: event.published,
          }}
        />
        <div className="mt-4 text-right">
          <DeleteButton action={deleteEvent.bind(null, event.id)} confirmText={`Supprimer « ${event.title} » et ses inscriptions ?`} />
        </div>
      </Panel>

      <Panel>
        <div id="inscrits" className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-semibold text-night-900">
            Inscrits : {event.registrations.length} inscription{event.registrations.length > 1 ? "s" : ""}, {people} personne{people > 1 ? "s" : ""}
          </h2>
          {event.registrations.length > 0 && (
            <a href={`/admin/evenements/${event.id}/inscrits.csv`} className="inline-flex items-center gap-1.5 rounded-full bg-night-950 px-4 py-2 text-sm font-bold text-gold-200">
              <Download className="size-4" /> Exporter (Excel)
            </a>
          )}
        </div>
        {event.registrations.length === 0 ? (
          <p className="text-sm text-night-800/60">Aucune inscription pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-night-800/60">
                <tr><th className="py-2">Nom</th><th>Téléphone</th><th>Accompagnants</th><th>Inscrit le</th></tr>
              </thead>
              <tbody className="divide-y divide-night-900/5">
                {event.registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 font-semibold text-night-900">{r.name}</td>
                    <td><a href={`tel:${r.phone}`} className="hover:text-gold-600">{r.phone}</a></td>
                    <td>{r.guests || "—"}</td>
                    <td className="text-night-800/60">{r.createdAt.toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
