import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { mediaUrl } from "@/lib/media";
import { toLocalInput } from "@/lib/time";
import { deletePost } from "@/actions/posts";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PostForm } from "@/components/blog/PostForms";
import { PhotoManager } from "@/components/blog/PhotoManager";

export const metadata: Metadata = { title: "Modifier le récit" };

export default async function EditPost({ params }: PageProps<"/admin/blog/[id]">) {
  await requireRole("RESPONSABLE");
  const { id } = await params;
  const [post, ministries] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { photos: { orderBy: { order: "asc" }, include: { media: { select: { width: true, height: true } } } } } }),
    db.ministry.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);
  if (!post) notFound();

  return (
    <>
      <Link href="/admin/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-night-800/70 hover:text-night-900"><ArrowLeft className="size-4" /> Tous les récits</Link>
      <AdminTitle title={post.title} text={post.published ? "Publié sur le blog et dans la galerie." : "Brouillon : ajoutez des photos et un récit, puis cochez « Publié »."}>
        <div className="flex items-center gap-2">
          {post.published && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-night-900/15 px-4 py-2 text-sm font-bold text-night-900"><ExternalLink className="size-4" /> Voir</Link>
          )}
          <DeleteButton action={deletePost.bind(null, post.id)} confirmText="Supprimer ce récit et toutes ses photos ?" />
        </div>
      </AdminTitle>
      <Panel className="mb-6">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Photos <span className="text-base text-night-800/50">({post.photos.length})</span></h2>
        <PhotoManager
          postId={post.id}
          coverId={post.coverId}
          photos={post.photos.map((p) => ({ id: p.id, mediaId: p.mediaId, src: mediaUrl(p.mediaId), caption: p.caption, width: p.media.width, height: p.media.height }))}
        />
      </Panel>
      <Panel>
        <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Récit</h2>
        <PostForm
          ministries={ministries}
          post={{
            id: post.id,
            title: post.title,
            category: post.category,
            date: post.date ? toLocalInput(post.date).slice(0, 10) : "",
            time: post.time ?? "",
            place: post.place ?? "",
            excerpt: post.excerpt,
            body: post.body,
            verseText: post.verseText ?? "",
            verseRef: post.verseRef ?? "",
            ministry: post.ministry ?? "",
            published: post.published,
          }}
        />
      </Panel>
    </>
  );
}
