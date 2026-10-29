import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { caseTotals, VISIBILITY_LABELS } from "@/lib/solidarity";
import { formatXOF } from "@/lib/money";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { ProgressBar } from "@/components/solidarity/Progress";

export const metadata: Metadata = { title: "Solidarité" };

const SECTIONS = [
  { status: "PROPOSED", title: "Demandes à examiner", empty: "Aucune demande en attente." },
  { status: "OPEN", title: "Collectes en cours", empty: "Aucune collecte en cours." },
  { status: "CLOSED", title: "Collectes terminées", empty: "" },
  { status: "REJECTED", title: "Demandes classées", empty: "" },
] as const;

export default async function SolidarityAdmin() {
  await requireRole("TRESORIER");
  const cases = await db.solidarityCase.findMany({ orderBy: { createdAt: "desc" }, include: { requestedBy: { select: { firstName: true, lastName: true } } } });
  const totals = await caseTotals(cases.map((c) => c.id));

  return (
    <>
      <AdminTitle title="Solidarité" text="Demandes d'aide confidentielles, collectes et aides versées. Rien n'est publié sans validation." />
      {SECTIONS.map((s) => {
        const list = cases.filter((c) => c.status === s.status);
        if (list.length === 0 && !s.empty) return null;
        return (
          <Panel key={s.status} className="mb-6">
            <h2 className="mb-2 font-serif text-2xl font-semibold text-night-900">
              {s.title} <span className="text-base text-night-800/50">({list.length})</span>
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-night-800/60">{s.empty}</p>
            ) : (
              <ul className="divide-y divide-night-900/5">
                {list.map((c) => {
                  const t = totals.get(c.id)!;
                  return (
                    <li key={c.id} className="grid gap-3 py-4 sm:grid-cols-[1.5fr_1fr_auto] sm:items-center">
                      <div>
                        <Link href={`/admin/solidarite/${c.id}`} className="font-serif text-xl font-semibold text-night-900 hover:text-gold-600">{c.title}</Link>
                        <p className="text-sm text-night-800/60">
                          {c.reason} · {VISIBILITY_LABELS[c.visibility]}
                          {c.requestedBy && ` · demandé par ${c.requestedBy.firstName} ${c.requestedBy.lastName}`} · {c.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {s.status === "OPEN" || s.status === "CLOSED" ? (
                        <div className="text-sm">
                          <ProgressBar raised={t.raised} goal={c.goal} />
                          <p className="mt-1 text-xs text-night-800/60">Versé : {formatXOF(t.paidOut)}</p>
                        </div>
                      ) : <span />}
                      <Link href={`/admin/solidarite/${c.id}`} className="text-sm font-bold text-gold-600">{s.status === "PROPOSED" ? "Examiner" : "Gérer"}</Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        );
      })}
    </>
  );
}
