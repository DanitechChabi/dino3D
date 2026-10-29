import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { SOLIDARITY_REASONS } from "@/lib/solidarity";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { HelpRequestForm } from "@/components/solidarity/HelpRequestForm";

export const metadata: Metadata = { title: "Demander de l'aide", robots: { index: false } };

export default async function HelpRequestPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Solidarité" title="Demander de l'aide" subtitle="« Invoque-moi au jour de la détresse ; je te délivrerai. » — Psaume 50:15" />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <Reveal>
            <HelpRequestForm reasons={SOLIDARITY_REASONS} phone={user.phone} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
