import "server-only";
import { cache } from "react";
import { db } from "./db";
import { churchParts } from "./time";
import { mediaUrl } from "./media";
import { activities as staticActivities, type Activity } from "@/content/activities";

type PostWithPhotos = Awaited<ReturnType<typeof loadPosts>>[number];

function loadPosts() {
  return db.post.findMany({
    where: { published: true },
    include: { photos: { orderBy: { order: "asc" }, include: { media: { select: { id: true, width: true, height: true } } } } },
  });
}

/** Article publié depuis l'administration → même forme que les activités écrites dans le code. */
export function postToActivity(p: PostWithPhotos): Activity {
  const photos = p.photos.map((ph) => ({ src: mediaUrl(ph.media.id), caption: ph.caption, width: ph.media.width, height: ph.media.height }));
  const cover = Math.max(0, p.photos.findIndex((ph) => ph.media.id === p.coverId));
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    ministry: p.ministry ?? undefined,
    date: p.date ? churchParts(p.date).day : undefined,
    time: p.time ?? undefined,
    place: p.place ?? undefined,
    excerpt: p.excerpt,
    body: p.body.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
    verse: p.verseText && p.verseRef ? { text: p.verseText, ref: p.verseRef } : undefined,
    cover,
    photos,
  };
}

/** Toutes les activités (code + administration), les plus récentes d'abord. */
export const getActivities = cache(async (): Promise<Activity[]> => {
  const posts = (await loadPosts()).filter((p) => p.photos.length > 0).map(postToActivity);
  const bySlug = new Map([...staticActivities, ...posts].map((a) => [a.slug, a]));
  return [...bySlug.values()].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
});

export async function findActivity(slug: string) {
  return (await getActivities()).find((a) => a.slug === slug);
}
