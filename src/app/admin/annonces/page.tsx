import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { deleteAnnouncement } from "@/actions/admin";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Annonces" };

export default async function AnnouncementsAdmin() {
  await requireRole("RESPONSABLE");
  const items = await db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { firstName: true, lastName: true } } },
  });
  return (
    <>
      <AdminTitle title="Annonces" text="Publiez les nouvelles de l'église sur le site et dans l'espace membre." />
      <Panel className="mb-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Nouvelle annonce</h2>
        <AnnouncementForm />
      </Panel>
      <div className="space-y-4">
        {items.map((a) => (
          <Panel key={a.id}>
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-serif text-xl font-semibold text-night-900">{a.title}</span>
                  <span className="ml-3 text-sm text-night-800/60">
                    {a.createdAt.toLocaleDateString("fr-FR")}
                    {a.author && ` · ${a.author.firstName} ${a.author.lastName}`}
                    {!a.published && " · brouillon"}
                    {a.pinned && " · épinglée"}
                  </span>
                </span>
                <span className="text-sm font-bold text-gold-600">Modifier</span>
              </summary>
              <div className="mt-5 border-t border-night-900/10 pt-5">
                <AnnouncementForm announcement={a} />
                <div className="mt-3 text-right">
                  <DeleteButton action={deleteAnnouncement.bind(null, a.id)} confirmText={`Supprimer « ${a.title} » ?`} />
                </div>
              </div>
            </details>
          </Panel>
        ))}
      </div>
    </>
  );
}
