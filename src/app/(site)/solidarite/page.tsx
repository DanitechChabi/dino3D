import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, HeartHandshake, Lock, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { beneficiaryLabel, canReview, caseTotals, isAcceptingGifts, visibleWhere } from "@/lib/solidarity";
import { formatXOF } from "@/lib/money";
import { formatDay } from "@/lib/time";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProgressBar } from "@/components/solidarity/Progress";

export const metadata: Metadata = { title: "Solidarité", description: "Collectes de solidarité de l'EBB-JR de Tanmey : maladie, deuil, naissance, scolarité…" };

export default async function SolidarityPage() {
  const user = await getCurrentUser();
  const staff = canReview(user?.role);
  const cases = await db.solidarityCase.findMany({ where: visibleWhere(!!user), orderBy: [{ status: "asc" }, { reviewedAt: "desc" }] });
  const hiddenCount = user ? 0 : await db.solidarityCase.count({ where: { status: "OPEN", visibility: "MEMBERS" } });
  const totals = await caseTotals(cases.map((c) => c.id));
  const open = cases.filter((c) => c.status === "OPEN");
  const closed = cases.filter((c) => c.status === "CLOSED");
  const paidOutTotal = [...totals.values()].reduce((n, t) => n + t.paidOut, 0);
  const helped = closed.length + open.filter((c) => (totals.get(c.id)?.paidOut ?? 0) > 0).length;

  return (
    <>
      <PageHeader eyebrow="Solidarité" title="Portez les fardeaux les uns des autres" subtitle="« …et vous accomplirez ainsi la loi de Christ. » — Galates 6:2" />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-12 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Collectes en cours", value: open.length },
              { label: "Familles soutenues", value: helped },
              { label: "Aides versées (F CFA)", value: paidOutTotal },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl bg-night-950 p-6 text-center text-white">
                <p className="text-gold-sheen font-serif text-4xl font-semibold tabular-nums"><AnimatedNumber value={s.value} /></p>
                <p className="mt-1 text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </Reveal>

          <SectionTitle eyebrow="En ce moment" title="Collectes en cours" />
          {open.length === 0 && (
            <p className="rounded-3xl border border-dashed border-gold-500/40 bg-white p-8 text-center text-night-800/70">Aucune collecte en cours pour le moment. Gloire à Dieu !</p>
          )}
          {hiddenCount > 0 && (
            <p className="mb-6 flex items-center gap-2 rounded-2xl bg-parchment p-4 text-sm text-night-800">
              <Lock className="size-4 text-gold-600" />
              {hiddenCount} collecte{hiddenCount > 1 ? "s sont réservées" : " est réservée"} aux membres. <Link href="/connexion?suite=/solidarite" className="font-bold text-gold-600">Connectez-vous</Link> pour les voir.
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {open.map((c, i) => {
              const t = totals.get(c.id)!;
              return (
                <Reveal key={c.id} delay={(i % 3) * 0.08}>
                  <Link href={`/solidarite/${c.slug}`} className="block h-full">
                    <TiltCard className="flex h-full flex-col rounded-3xl border border-gold-500/20 bg-white p-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-gold-300/40 px-3 py-1 text-xs font-bold text-night-900">{c.reason}</span>
                        {c.visibility === "MEMBERS" && <span className="flex items-center gap-1 text-xs text-night-800/60"><Lock className="size-3.5" /> Membres</span>}
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight text-night-900">{c.title}</h3>
                      <p className="mt-1 text-sm text-night-800/70">{beneficiaryLabel(c, staff)}</p>
                      <div className="mt-auto pt-6">
                        <ProgressBar raised={t.raised} goal={c.goal} />
                        <p className="mt-3 flex items-center justify-between text-xs text-night-800/60">
                          <span className="flex items-center gap-1"><Users className="size-3.5" /> {t.donors} donateur{t.donors > 1 ? "s" : ""}</span>
                          {c.deadline && <span className="flex items-center gap-1"><CalendarClock className="size-3.5" /> {isAcceptingGifts(c) ? `jusqu'au ${formatDay(c.deadline, false).toLowerCase()}` : "terminée"}</span>}
                        </p>
                      </div>
                    </TiltCard>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-950 py-20 text-white">
        <div className="pointer-events-none absolute -left-20 top-0 size-96 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <HeartHandshake className="size-12 text-gold-300" />
          <h2 className="mt-4 font-serif text-4xl font-semibold">Vous traversez une épreuve ?</h2>
          <p className="mt-3 max-w-xl text-white/70">
            Maladie, deuil, naissance, scolarité… Confiez-nous votre besoin, pour vous ou pour un frère. Votre demande reste confidentielle : seuls le pasteur et le trésorier la lisent.
          </p>
          <div className="mt-8">
            <MagneticButton href="/solidarite/demande">Demander de l&apos;aide</MagneticButton>
          </div>
        </div>
      </section>

      {closed.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle eyebrow="Transparence" title="Aides déjà apportées" />
            <ul className="divide-y divide-night-900/10 rounded-3xl border border-night-900/10 bg-white">
              {closed.map((c) => {
                const t = totals.get(c.id)!;
                return (
                  <li key={c.id}>
                    <Link href={`/solidarite/${c.slug}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-parchment/50">
                      <span>
                        <span className="block font-serif text-xl font-semibold text-night-900">{c.title}</span>
                        <span className="text-sm text-night-800/60">{c.reason} · {t.donors} donateur{t.donors > 1 ? "s" : ""}{c.closedAt && ` · clôturée le ${c.closedAt.toLocaleDateString("fr-FR")}`}</span>
                      </span>
                      <span className="flex items-center gap-2 text-right">
                        <span>
                          <span className="block font-bold text-night-900">{formatXOF(t.paidOut)} versés</span>
                          <span className="text-xs text-night-800/60">{formatXOF(t.raised)} collectés</span>
                        </span>
                        <ArrowRight className="size-4 text-gold-600" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
