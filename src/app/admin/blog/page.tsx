import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { mediaUrl } from "@/lib/media";
import { formatDay } from "@/lib/time";
import { activities } from "@/content/activities";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { NewPostForm } from "@/components/blog/PostForms";

export const metadata: Metadata = { title: "Blog & albums" };

export default async function BlogAdmin() {
  await requireRole("RESPONSABLE");
  const posts = await db.post.findMany({ orderBy: [{ date: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }], include: { _count: { select: { photos: true } } } });

  return (
    <>
      <AdminTitle title="Blog & albums" text="Chaque récit publié apparaît sur le blog et comme album dans la galerie, avec ses photos retouchées." />
      <Panel className="mb-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Nouveau récit</h2>
        <NewPostForm />
      </Panel>
      <Panel>
        <h2 className="mb-2 font-serif text-2xl font-semibold text-night-900">Récits <span className="text-base text-night-800/50">({posts.length})</span></h2>
        {posts.length === 0 ? (
          <p className="py-4 text-sm text-night-800/60">Aucun récit créé depuis l&apos;administration.</p>
        ) : (
          <ul className="divide-y divide-night-900/5">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-4 py-3 hover:bg-parchment/50">
                  <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-night-900/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.coverId && <img src={mediaUrl(p.coverId)} alt="" className="size-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-xl font-semibold text-night-900">{p.title}</span>
                    <span className="text-sm text-night-800/60">
                      {p.category}{p.date && ` · ${formatDay(p.date)}`} · {p._count.photos} photo{p._count.photos > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-night-900/5 text-night-800/70"}`}>{p.published ? "Publié" : "Brouillon"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-night-900/10 pt-4 text-xs text-night-800/60">
          Déjà sur le site (intégrés au code) : {activities.map((a) => a.title).join(" · ")}.
        </p>
      </Panel>
    </>
  );
}
