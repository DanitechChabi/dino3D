import type { Metadata } from "next";
import { Pin } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Annonces" };

export default async function AnnouncementsPage() {
  const items = await db.announcement.findMany({ where: { published: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] });
  return (
    <>
      <PageHeader eyebrow="Vie de l'église" title="Annonces" subtitle="Les nouvelles et communications de l'église." />
      <section className="py-20">
        <div className="mx-auto max-w-3xl space-y-5 px-4">
          {items.length === 0 && <p className="text-center text-night-800/60">Aucune annonce pour le moment.</p>}
          {items.map((a) => (
            <Reveal key={a.id}>
              <article className={`rounded-3xl border bg-white p-7 sm:p-9 ${a.pinned ? "border-gold-500/50 shadow-[0_20px_50px_-30px_rgba(179,134,42,.6)]" : "border-night-900/10"}`}>
                <p className="flex items-center gap-2 text-xs font-semibold text-night-800/60">
                  {a.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/40 px-2 py-0.5 text-gold-600">
                      <Pin className="size-3" /> Épinglée
                    </span>
                  )}
                  {a.createdAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-night-900">{a.title}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-night-800/80">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
