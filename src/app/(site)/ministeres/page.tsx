import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { MinistryIcon } from "@/components/MinistryIcon";

export const metadata: Metadata = { title: "Ministères" };

export default async function MinistriesPage() {
  const ministries = await db.ministry.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader eyebrow="Nos ministères" title="Un seul corps, plusieurs membres" subtitle="« Car, comme le corps est un et a plusieurs membres… ainsi en est-il de Christ. » — 1 Corinthiens 12:12" />
      <section className="py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.08}>
              <Link href={`/ministeres/${m.slug}`} className="block h-full">
                <TiltCard className="flex h-full flex-col rounded-3xl bg-night-950 p-8 text-white">
                  <span className="grid size-16 place-items-center rounded-2xl border border-gold-300/30 bg-gold-300/10 text-gold-200 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <MinistryIcon name={m.icon} className="size-7" />
                  </span>
                  <h2 className="mt-6 font-serif text-3xl font-semibold">{m.name}</h2>
                  <p className="mt-2 flex-1 leading-relaxed text-white/70">{m.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-gold-300">
                    En savoir plus <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
