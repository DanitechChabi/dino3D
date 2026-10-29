import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { caseTotals, SOLIDARITY_REASONS, VISIBILITY_LABELS } from "@/lib/solidarity";
import { formatXOF, METHOD_LABELS } from "@/lib/money";
import { churchParts } from "@/lib/time";
import { reopenCase } from "@/actions/solidarity";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { ProgressBar } from "@/components/solidarity/Progress";
import { CloseForm, PayoutForm, RejectForm, ReviewForm } from "@/components/solidarity/AdminForms";

export const metadata: Metadata = { title: "Collecte" };

const STATUS = { PROPOSED: "Demande à examiner", OPEN: "Collecte en cours", CLOSED: "Collecte terminée", REJECTED: "Classée sans suite" };

export default async function CaseAdmin(props: PageProps<"/admin/solidarite/[id]">) {
  await requireRole("TRESORIER");
  const { id } = await props.params;
  const { cloturee } = await props.searchParams;
  const c = await db.solidarityCase.findUnique({
    where: { id },
    include: {
      requestedBy: { select: { firstName: true, lastName: true, phone: true } },
      reviewedBy: { select: { firstName: true } },
      payouts: { orderBy: { paidAt: "asc" } },
      donations: { where: { status: "SUCCEEDED" }, orderBy: { paidAt: "desc" } },
    },
  });
  if (!c) notFound();
  const t = (await caseTotals([c.id])).get(c.id)!;
  const today = churchParts(new Date()).day;

  return (
    <>
      <Link href="/admin/solidarite" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gold-600"><ArrowLeft className="size-4" /> Solidarité</Link>
      <AdminTitle title={c.title} text={`${STATUS[c.status]} · ${VISIBILITY_LABELS[c.visibility]}${c.reviewedBy ? ` · validée par ${c.reviewedBy.firstName}` : ""}`}>
        {(c.status === "OPEN" || c.status === "CLOSED") && (
          <Link href={`/solidarite/${c.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-bold text-night-900"><ExternalLink className="size-4" /> Voir la page</Link>
        )}
      </AdminTitle>

      {typeof cloturee === "string" && c.status === "CLOSED" && (
        <Panel className="mb-6 border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-800">
          Collecte clôturée.{Number(cloturee) >= 0 && ` Remerciement envoyé à ${cloturee} appareil(s).`}
        </Panel>
      )}

      {c.requestedBy && (
        <Panel className="mb-6 bg-parchment">
          <p className="text-sm text-night-800">
            Demande confidentielle de <strong>{c.requestedBy.firstName} {c.requestedBy.lastName}</strong>
            {c.forSelf ? " (pour lui-même / elle-même)" : ` pour ${c.beneficiaryName}`}
            {c.contactPhone && (
              <a href={`tel:${c.contactPhone}`} className="ml-2 inline-flex items-center gap-1 font-bold text-gold-600"><Phone className="size-3.5" /> {c.contactPhone}</a>
            )}
          </p>
        </Panel>
      )}

      {(c.status === "OPEN" || c.status === "CLOSED") && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Collecté", value: formatXOF(t.raised) },
            { label: "Donateurs", value: String(t.donors) },
            { label: "Versé au bénéficiaire", value: formatXOF(t.paidOut) },
          ].map((k) => (
            <div key={k.label} className="rounded-3xl bg-night-950 p-5 text-white">
              <p className="font-serif text-3xl font-semibold">{k.value}</p>
              <p className="text-sm text-white/60">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {c.status !== "REJECTED" && (
        <Panel className="mb-6">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">{c.status === "PROPOSED" ? "Examiner et publier" : "Informations de la collecte"}</h2>
          {c.goal && <div className="mb-5 max-w-md"><ProgressBar raised={t.raised} goal={c.goal} /></div>}
          <ReviewForm
            reasons={SOLIDARITY_REASONS}
            c={{
              id: c.id,
              status: c.status,
              title: c.title,
              beneficiaryName: c.beneficiaryName,
              reason: c.reason,
              story: c.story,
              goal: c.goal ? String(c.goal) : "",
              deadline: c.deadline ? churchParts(c.deadline).day : "",
              visibility: c.visibility,
            }}
          />
          {c.status === "PROPOSED" && <div className="mt-4 border-t border-night-900/10 pt-4"><RejectForm id={c.id} /></div>}
        </Panel>
      )}

      {(c.status === "OPEN" || c.status === "CLOSED") && (
        <>
          <Panel className="mb-6">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Aide remise au bénéficiaire</h2>
            {c.payouts.length > 0 && (
              <ul className="mb-5 divide-y divide-night-900/5 text-sm">
                {c.payouts.map((p) => (
                  <li key={p.id} className="flex justify-between gap-4 py-2">
                    <span>{p.paidAt.toLocaleDateString("fr-FR")}{p.note && ` · ${p.note}`}</span>
                    <span className="font-bold">{formatXOF(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <PayoutForm caseId={c.id} today={today} />
          </Panel>

          <Panel className="mb-6">
            <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Dons reçus ({c.donations.length})</h2>
            {c.donations.length === 0 ? (
              <p className="text-sm text-night-800/60">Aucun don pour le moment.</p>
            ) : (
              <ul className="divide-y divide-night-900/5 text-sm">
                {c.donations.map((d) => (
                  <li key={d.id} className="flex justify-between gap-4 py-2">
                    <span>{d.anonymous ? `Anonyme (${d.donorName})` : d.donorName} <span className="text-night-800/50">· {METHOD_LABELS[d.method]} · {d.paidAt?.toLocaleDateString("fr-FR")}</span>{d.note && <span className="block text-xs italic text-night-800/60">« {d.note} »</span>}</span>
                    <span className="font-bold">{formatXOF(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {c.status === "OPEN" ? (
            <Panel>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Clôturer</h2>
              <CloseForm id={c.id} />
            </Panel>
          ) : (
            <form action={reopenCase.bind(null, c.id)}>
              <button className="text-sm font-semibold text-gold-600 hover:underline">Rouvrir la collecte</button>
            </form>
          )}
        </>
      )}
    </>
  );
}
