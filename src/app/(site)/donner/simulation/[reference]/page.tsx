import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/payments";
import { simulatePayment } from "@/actions/giving";
import { formatXOF, METHOD_LABELS } from "@/lib/money";

export const metadata: Metadata = { title: "Paiement (mode test)", robots: { index: false } };

// Page de test qui imite celle d'un fournisseur de paiement. N'existe qu'en mode simulation.
export default async function SimulationPage(props: PageProps<"/donner/simulation/[reference]">) {
  if (getProvider()?.id !== "simulation") notFound();
  const { reference } = await props.params;
  const d = await db.donation.findUnique({ where: { reference }, include: { category: true } });
  if (!d || d.provider !== "simulation") notFound();

  return (
    <section className="flex min-h-svh items-center justify-center bg-parchment px-4 pb-16 pt-32">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-2 bg-amber-400 px-5 py-3 text-sm font-bold text-amber-950">
          <FlaskConical className="size-4" /> Prestataire de paiement — MODE TEST
        </div>
        <div className="p-6">
          <p className="text-sm text-night-800/60">{d.category.name} · {METHOD_LABELS[d.method]}</p>
          <p className="mt-1 font-serif text-5xl font-semibold text-night-900">{formatXOF(d.amount)}</p>
          <p className="mt-2 text-sm text-night-800/70">{d.donorName}{d.donorPhone ? ` · ${d.donorPhone}` : ""}</p>
          {d.status !== "PENDING" ? (
            <p className="mt-6 rounded-2xl bg-night-900/5 p-4 text-sm">Cette transaction est déjà traitée.</p>
          ) : (
            <div className="mt-6 grid gap-2">
              <form action={simulatePayment.bind(null, reference, "SUCCEEDED")}>
                <button className="w-full rounded-full bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700">Simuler un paiement réussi</button>
              </form>
              <form action={simulatePayment.bind(null, reference, "FAILED")}>
                <button className="w-full rounded-full border border-red-200 py-3 font-bold text-red-700 hover:bg-red-50">Simuler un échec</button>
              </form>
              <form action={simulatePayment.bind(null, reference, "CANCELLED")}>
                <button className="w-full py-2 text-sm text-night-800/60 underline">Annuler</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
