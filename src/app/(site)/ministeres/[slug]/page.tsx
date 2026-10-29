import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";

export async function generateMetadata(props: PageProps<"/ministeres/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = await db.ministry.findUnique({ where: { slug } });
  return { title: m?.name ?? "Ministère" };
}

export default async function MinistryPage(props: PageProps<"/ministeres/[slug]">) {
  const { slug } = await props.params;
  const ministry = await db.ministry.findUnique({
    where: { slug },
    include: { members: { where: { isLeader: true }, include: { user: { select: { firstName: true, lastName: true } } } } },
  });
  if (!ministry) notFound();

  return (
    <>
      <PageHeader eyebrow="Ministère" title={ministry.name} subtitle={ministry.summary} />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <p className="font-serif text-2xl leading-relaxed text-night-800">{ministry.description}</p>
          </Reveal>
          {ministry.members.length > 0 && (
            <Reveal delay={0.1} className="mt-10 rounded-3xl border border-gold-500/20 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-600">Responsable{ministry.members.length > 1 ? "s" : ""}</p>
              <p className="mt-2 font-serif text-2xl text-night-900">
                {ministry.members.map((m) => `${m.user.firstName} ${m.user.lastName}`).join(", ")}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href={`/contact?sujet=${encodeURIComponent(`Ministère ${ministry.name}`)}`} variant="dark">
              Je veux servir dans ce ministère
            </MagneticButton>
            <Link href="/ministeres" className="inline-flex items-center gap-1 text-sm font-bold text-gold-600">
              <ArrowLeft className="size-4" /> Tous les ministères
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
