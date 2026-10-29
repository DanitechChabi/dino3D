import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { canSeeConfidential, filtersWhere, parseFilters } from "@/lib/finance";
import { formatXOF, METHOD_LABELS, STATUS_LABELS } from "@/lib/money";
import { cancelManualDonation } from "@/actions/finance";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Dons" };

export default async function DonationsList(props: PageProps<"/admin/finances/dons">) {
  const viewer = await requireRole("TRESORIER");
  const sp = await props.searchParams;
  const f = parseFilters(sp);
  const where = filtersWhere(f);
  const [donations, total, categories] = await Promise.all([
    db.donation.findMany({ where, orderBy: { createdAt: "desc" }, take: 300, include: { category: true, recordedBy: { select: { firstName: true } } } }),
    db.donation.aggregate({ where, _sum: { amount: true }, _count: true }),
    db.givingCategory.findMany({ orderBy: { order: "asc" } }),
  ]);
  const seeAll = canSeeConfidential(viewer.role);
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();

  const donor = (d: (typeof donations)[number]) => {
    if (d.category.confidential && !seeAll) return <span className="inline-flex items-center gap-1 text-night-800/50"><Lock className="size-3.5" /> Confidentiel</span>;
    if (d.anonymous) return seeAll ? <>Anonyme <span className="text-night-800/50">({d.donorName})</span></> : "Anonyme";
    return d.donorName ?? "—";
  };

  return (
    <>
      <Link href="/admin/finances" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gold-600"><ArrowLeft className="size-4" /> Finances</Link>
      <AdminTitle title="Tous les dons" text={`${total._count} don${total._count > 1 ? "s" : ""} · ${formatXOF(total._sum.amount ?? 0)}`}>
        <a href={`/admin/finances/export.csv?${qs}`} className="inline-flex items-center gap-1.5 rounded-full bg-night-950 px-4 py-2 text-sm font-bold text-gold-200">
          <Download className="size-4" /> Exporter (Excel)
        </a>
      </AdminTitle>

      <Panel className="mb-6">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="text-sm"><span className="label">Du</span><input type="date" name="du" defaultValue={f.from} className="field" /></label>
          <label className="text-sm"><span className="label">Au</span><input type="date" name="au" defaultValue={f.to} className="field" /></label>
          <label className="text-sm">
            <span className="label">Type</span>
            <select name="type" defaultValue={f.category ?? ""} className="field">
              <option value="">Tous</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">Moyen</span>
            <select name="moyen" defaultValue={f.method ?? ""} className="field">
              <option value="">Tous</option>
              {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="label">État</span>
            <select name="statut" defaultValue={f.status} className="field">
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <div className="flex items-end"><button className="w-full rounded-full bg-gold-400 px-4 py-3 text-sm font-bold text-night-950">Filtrer</button></div>
        </form>
      </Panel>

      <Panel className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-night-900/10 text-xs uppercase tracking-wider text-night-800/60">
            <tr><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Donateur</th><th className="p-4">Moyen</th><th className="p-4 text-right">Montant</th><th className="p-4">Réf.</th><th className="p-4" /></tr>
          </thead>
          <tbody className="divide-y divide-night-900/5">
            {donations.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-night-800/60">Aucun don sur cette période.</td></tr>}
            {donations.map((d) => (
              <tr key={d.id} className={d.status === "CANCELLED" ? "text-night-800/40 line-through" : ""}>
                <td className="p-4 tabular-nums">{(d.paidAt ?? d.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="p-4 font-semibold text-night-900">{d.category.name}</td>
                <td className="p-4">{donor(d)}</td>
                <td className="p-4">{METHOD_LABELS[d.method]}{d.recordedBy && <span className="block text-xs text-night-800/50">saisi par {d.recordedBy.firstName}</span>}</td>
                <td className="p-4 text-right font-bold tabular-nums text-night-900">{formatXOF(d.amount)}</td>
                <td className="p-4 font-mono text-xs text-night-800/60">{d.reference}</td>
                <td className="p-4 text-right">
                  {!d.provider && d.status === "SUCCEEDED" && (
                    <DeleteButton action={cancelManualDonation.bind(null, d.id)} confirmText={`Annuler cette saisie de ${formatXOF(d.amount)} ? Elle restera visible dans le journal.`} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
