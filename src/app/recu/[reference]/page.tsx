import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatXOF, METHOD_LABELS } from "@/lib/money";
import { formatDay, formatTime } from "@/lib/time";
import { church } from "@/content/site";
import { PrintButton } from "@/components/giving/PrintButton";

export const metadata: Metadata = { title: "Reçu de don", robots: { index: false } };

// Reçu imprimable (ou enregistrable en PDF). Le lien contient une référence non devinable.
export default async function ReceiptPage(props: PageProps<"/recu/[reference]">) {
  const { reference } = await props.params;
  const d = await db.donation.findUnique({ where: { reference }, include: { category: true, solidarity: { select: { title: true, visibility: true } } } });
  if (!d || d.status !== "SUCCEEDED" || !d.paidAt) notFound();

  const rows = [
    ["Référence", d.reference],
    ["Date", `${formatDay(d.paidAt)} à ${formatTime(d.paidAt)}`],
    ["Donateur", d.anonymous ? "Anonyme" : (d.donorName ?? "—")],
    ["Type de don", d.category.name],
    ...(d.solidarity ? [["Collecte", d.solidarity.title]] : []),
    ["Moyen de paiement", METHOD_LABELS[d.method]],
    ...(d.note ? [["Message", d.note]] : []),
  ];

  return (
    <main className="min-h-svh bg-parchment px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex justify-end print:hidden">
          <PrintButton />
        </div>
        <article className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-white p-8 shadow-xl print:rounded-none print:border-0 print:shadow-none sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold-300/20 blur-2xl print:hidden" />
          <header className="relative flex items-center gap-4 border-b border-night-900/10 pb-6">
            <Image src="/brand/logo-ebb-jr-192.png" alt="" width={72} height={72} className="rounded-full" />
            <div>
              <p className="font-serif text-xl font-semibold leading-tight text-night-900">{church.name}</p>
              <p className="text-sm text-night-800/60">{church.city} · {church.phone} · {church.email}</p>
            </div>
          </header>
          <h1 className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Reçu de don</h1>
          <p className="relative mt-2 font-serif text-5xl font-semibold text-night-900">{formatXOF(d.amount)}</p>
          <dl className="relative mt-6 divide-y divide-night-900/10 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-night-800/60">{k}</dt>
                <dd className="text-right font-semibold text-night-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="relative mt-8 font-serif text-lg italic text-night-800">
            « Dieu aime celui qui donne avec joie. » — 2 Corinthiens 9:7
          </p>
          <p className="relative mt-2 text-sm text-night-800/60">Que le Seigneur vous bénisse abondamment. Merci pour votre fidélité.</p>
        </article>
      </div>
    </main>
  );
}
