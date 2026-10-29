import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { formatDay, formatTime, toLocalInput } from "@/lib/time";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { LiveForm } from "@/components/live/LiveForm";
import { LiveActions } from "@/components/live/LiveActions";

export const metadata: Metadata = { title: "Lives & prédications" };

const STATUS = { SCHEDULED: "Programmé", LIVE: "En direct", ENDED: "Archivé", CANCELLED: "Annulé" };

export default async function LivesAdmin() {
  await requireRole("RESPONSABLE");
  const lives = await db.livestream.findMany({ orderBy: { scheduledAt: "desc" } });
  const seriesList = [...new Set(lives.map((l) => l.series).filter(Boolean))] as string[];
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
  const defaultDate = `${toLocalInput(nextSunday).slice(0, 10)}T09:30`;
  const groups = [
    { title: "En direct", items: lives.filter((l) => l.status === "LIVE") },
    { title: "Programmés", items: lives.filter((l) => l.status === "SCHEDULED").reverse() },
    { title: "Archives", items: lives.filter((l) => l.status === "ENDED") },
    { title: "Annulés", items: lives.filter((l) => l.status === "CANCELLED") },
  ];

  return (
    <>
      <AdminTitle title="Lives & prédications" text="Programmez les directs, lancez-les en un clic (pastille « EN DIRECT » sur tout le site + notification), puis retrouvez-les en archives." />
      <Panel className="mb-6">
        <LiveForm defaultDate={defaultDate} seriesList={seriesList} />
      </Panel>
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <Panel key={g.title} className={`mb-6 ${g.title === "En direct" ? "ring-2 ring-red-500" : ""}`}>
            <h2 className="mb-2 font-serif text-2xl font-semibold text-night-900">{g.title} <span className="text-base text-night-800/50">({g.items.length})</span></h2>
            <ul className="divide-y divide-night-900/5">
              {g.items.map((l) => (
                <li key={l.id} className="py-4">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <span>
                        <span className="block font-serif text-xl font-semibold text-night-900">{l.title}</span>
                        <span className="text-sm text-night-800/60">
                          {STATUS[l.status]} · {formatDay(l.scheduledAt)} {formatTime(l.scheduledAt)}
                          {l.preacher && ` · ${l.preacher}`}
                          {!l.url && " · lien manquant"}
                          {!l.published && " · non publié"}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-gold-600">Modifier</span>
                    </summary>
                    <div className="mt-5 border-t border-night-900/10 pt-5">
                      {l.status === "ENDED" && l.url && (
                        <Link href={`/predications/${l.slug}`} target="_blank" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-night-900"><ExternalLink className="size-4" /> Voir la page</Link>
                      )}
                      <LiveForm
                        seriesList={seriesList}
                        live={{
                          id: l.id,
                          title: l.title,
                          description: l.description,
                          preacher: l.preacher ?? "",
                          series: l.series ?? "",
                          scripture: l.scripture ?? "",
                          scheduledAt: toLocalInput(l.scheduledAt),
                          url: l.url ?? "",
                          published: l.published,
                        }}
                      />
                    </div>
                  </details>
                  <div className="mt-2">
                    <LiveActions id={l.id} status={l.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ),
      )}
    </>
  );
}
