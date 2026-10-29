import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { refreshDonation } from "@/lib/payments";
import { formatXOF } from "@/lib/money";
import { LightParticles } from "@/components/motion/LightParticles";
import { DonationStatusView } from "@/components/giving/DonationStatusView";

export const metadata: Metadata = { title: "Merci pour votre don", robots: { index: false } };

export default async function ThanksPage(props: PageProps<"/donner/merci/[reference]">) {
  const { reference } = await props.params;
  const status = await refreshDonation(reference);
  if (!status) notFound();
  const d = await db.donation.findUniqueOrThrow({ where: { reference }, include: { category: { select: { name: true } } } });

  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-night-950 px-4 pb-16 pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,#22326b_0%,#070d24_60%,#04081a_100%)]" />
      <div className="absolute left-1/2 top-[40%] size-[120vmax] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_0%,transparent_45%)]">
        <div className="size-full animate-rays bg-[repeating-conic-gradient(from_0deg,rgba(255,240,200,.12)_0deg_3deg,transparent_3deg_14deg)]" />
      </div>
      <LightParticles density={60} />
      <div className="relative mx-auto max-w-xl">
        <DonationStatusView reference={reference} initial={status} />
        <p className="mt-10 text-center text-sm text-white/50">
          {d.category.name} · {formatXOF(d.amount)} · Réf. {d.reference}
        </p>
      </div>
    </section>
  );
}
