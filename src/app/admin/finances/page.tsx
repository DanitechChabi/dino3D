import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarRange, Clock, Sun } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { financeOverview } from "@/lib/finance";
import { formatXOF, METHOD_LABELS } from "@/lib/money";
import { churchParts } from "@/lib/time";
import { getProvider } from "@/lib/payments";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MonthlyColumns, BarList } from "@/components/finance/Charts";
import { CashForm } from "@/components/finance/CashForm";
import { CategoryAdmin } from "@/components/finance/CategoryAdmin";

export const metadata: Metadata = { title: "Finances" };

export default async function FinancesPage() {
  await requireRole("TRESORIER");
  const [o, categories, members] = await Promise.all([
    financeOverview(),
    db.givingCategory.findMany({ orderBy: { order: "asc" } }),
    db.user.findMany({ where: { active: true }, select: { phone: true, firstName: true, lastName: true }, orderBy: { lastName: "asc" } }),
  ]);
  const provider = getProvider();
  const year = new Date().getFullYear();

  const kpis = [
    { label: "Aujourd'hui", icon: Sun, ...o.today },
    { label: "Ce mois-ci", icon: CalendarDays, ...o.month },
    { label: `Année ${year}`, icon: CalendarRange, ...o.year },
  ];

  return (
    <>
      <AdminTitle title="Finances" text="Dîmes, offrandes et quêtes : en ligne et en espèces.">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/finances/dons" className="inline-flex items-center gap-1.5 rounded-full bg-night-950 px-4 py-2 text-sm font-bold text-gold-200">Tous les dons <ArrowRight className="size-4" /></Link>
          <Link href="/admin/finances/journal" className="inline-flex items-center gap-1.5 rounded-full border border-night-900/15 bg-white px-4 py-2 text-sm font-bold text-night-900">Journal</Link>
        </div>
      </AdminTitle>

      {!provider && (
        <Panel className="mb-6 border-amber-300 bg-amber-50 text-sm text-amber-900">
          Le paiement en ligne n&apos;est pas activé (PAYMENT_PROVIDER). Les saisies en espèces fonctionnent normalement.
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, icon: Icon, total, count }) => (
          <div key={label} className="relative overflow-hidden rounded-3xl bg-night-950 p-6 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold-400/20 blur-2xl" />
            <Icon className="size-5 text-gold-300" />
            <p className="mt-4 font-serif text-3xl font-semibold tabular-nums sm:text-4xl"><AnimatedNumber value={total} suffix=" F" /></p>
            <p className="mt-1 text-sm text-white/65">{label} · {count} don{count > 1 ? "s" : ""}</p>
          </div>
        ))}
        <Link href="/admin/finances/dons?statut=PENDING" className="rounded-3xl border border-night-900/10 bg-white p-6">
          <Clock className="size-5 text-gold-600" />
          <p className="mt-4 font-serif text-4xl font-semibold text-night-900"><AnimatedNumber value={o.pending} /></p>
          <p className="mt-1 text-sm text-night-800/60">Paiements en attente</p>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <h2 className="font-serif text-2xl font-semibold text-night-900">Dons reçus par mois</h2>
          <p className="mb-6 text-sm text-night-800/60">12 derniers mois, tous types confondus</p>
          <MonthlyColumns data={o.monthly} />
        </Panel>
        <Panel>
          <h2 className="font-serif text-2xl font-semibold text-night-900">Par type de don</h2>
          <p className="mb-6 text-sm text-night-800/60">Année {year}</p>
          <BarList data={o.byCategory} />
          {o.byMethod.length > 0 && (
            <p className="mt-6 border-t border-night-900/10 pt-4 text-sm text-night-800/70">
              {o.byMethod.map((m) => `${METHOD_LABELS[m.method]} : ${formatXOF(m.total)}`).join(" · ")}
            </p>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <h2 className="mb-1 font-serif text-2xl font-semibold text-night-900">Saisir une quête ou un don reçu au temple</h2>
        <p className="mb-5 text-sm text-night-800/60">Espèces ou virement. Chaque saisie est tracée dans le journal.</p>
        <CashForm
          categories={categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }))}
          today={churchParts(new Date()).day}
          members={members.map((m) => ({ phone: m.phone, name: `${m.firstName} ${m.lastName}` }))}
        />
      </Panel>

      <Panel className="mt-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Types de dons</h2>
        <CategoryAdmin categories={categories.map((c) => ({ id: c.id, name: c.name, confidential: c.confidential, active: c.active }))} />
      </Panel>
    </>
  );
}
