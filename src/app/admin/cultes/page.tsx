import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { deleteService } from "@/actions/admin";
import { recurrenceLabel } from "@/lib/recurrence";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Cultes & horaires" };

export default async function ServicesAdmin() {
  await requireRole("ADMIN");
  const [services, ministries] = await Promise.all([
    db.service.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }], include: { ministry: { select: { name: true } } } }),
    db.ministry.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <AdminTitle title="Cultes & horaires" text="Ces horaires s'affichent sur le site, le compte à rebours et le pied de page." />
      <Panel className="mb-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Nouveau rendez-vous</h2>
        <ServiceForm ministries={ministries} />
      </Panel>
      <div className="space-y-4">
        {services.map((s) => (
          <Panel key={s.id}>
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-serif text-xl font-semibold text-night-900">{s.name}</span>
                  <span className="ml-3 text-sm text-night-800/60">{s.ministry && `${s.ministry.name} · `}{recurrenceLabel(s.dayOfWeek, s.weeks)} · {s.startTime.replace(":", "h")}{s.endTime && ` – ${s.endTime.replace(":", "h")}`}</span>
                </span>
                <span className="text-sm font-bold text-gold-600">Modifier</span>
              </summary>
              <div className="mt-5 border-t border-night-900/10 pt-5">
                <ServiceForm service={s} ministries={ministries} />
                <div className="mt-3 text-right">
                  <DeleteButton action={deleteService.bind(null, s.id)} confirmText={`Supprimer « ${s.name} » ?`} />
                </div>
              </div>
            </details>
          </Panel>
        ))}
      </div>
    </>
  );
}
