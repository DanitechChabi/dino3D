import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { AdminTitle, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Journal financier" };

const LABELS: Record<string, string> = {
  saisie: "Saisie",
  annulation: "Annulation",
  paiement_succeeded: "Paiement reçu",
  paiement_failed: "Paiement échoué",
  paiement_cancelled: "Paiement annulé",
  type_ajoute: "Type ajouté",
  type_active: "Type réactivé",
  type_desactive: "Type désactivé",
};

export default async function JournalPage() {
  await requireRole("TRESORIER");
  const logs = await db.financeLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { firstName: true, lastName: true } } } });
  return (
    <>
      <Link href="/admin/finances" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gold-600"><ArrowLeft className="size-4" /> Finances</Link>
      <AdminTitle title="Journal financier" text="Toutes les opérations, dans l'ordre, pour une transparence totale." />
      <Panel className="p-0 sm:p-0">
        <ul className="divide-y divide-night-900/5 text-sm">
          {logs.length === 0 && <li className="p-6 text-night-800/60">Aucune opération.</li>}
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
              <span className="w-36 shrink-0 tabular-nums text-night-800/60">{l.createdAt.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "short", timeStyle: "short" })}</span>
              <span className="rounded-full bg-gold-300/30 px-2.5 py-0.5 text-xs font-bold text-night-900">{LABELS[l.action] ?? l.action}</span>
              <span className="flex-1 text-night-900">{l.details}</span>
              <span className="text-night-800/60">{l.user ? `${l.user.firstName} ${l.user.lastName}` : "Système"}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
