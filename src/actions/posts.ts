"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { slugify } from "@/lib/events";
import { churchDateTime } from "@/lib/time";
import { saveMedia, mediaUrl } from "@/lib/media";
import { activities } from "@/content/activities";
import { keepValues, type FormState } from "@/lib/validation";

function refresh() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(title: string, exceptId?: string) {
  const base = slugify(title) || "article";
  let slug = base;
  for (let i = 2; ; i++) {
    const taken = activities.some((a) => a.slug === slug) || (await db.post.findFirst({ where: { slug, NOT: exceptId ? { id: exceptId } : undefined } }));
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

const createSchema = z.object({ title: z.string().trim().min(3, "Titre requis").max(150), category: z.string().trim().min(2).max(40) });

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("RESPONSABLE");
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const post = await db.post.create({
    data: { ...parsed.data, slug: await uniqueSlug(parsed.data.title), excerpt: "", body: "" },
  });
  redirect(`/admin/blog/${post.id}`);
}

const saveSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(3, "Titre requis").max(150),
  category: z.string().trim().min(2, "Catégorie requise").max(40),
  date: z.union([z.literal(""), z.iso.date("Date invalide")]).optional(),
  time: z.string().trim().max(40).optional(),
  place: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(300).default(""),
  body: z.string().trim().max(20000).default(""),
  verseText: z.string().trim().max(400).optional(),
  verseRef: z.string().trim().max(60).optional(),
  ministry: z.string().max(60).optional(),
  published: z.boolean(),
});

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("RESPONSABLE");
  const parsed = saveSchema.safeParse({ ...Object.fromEntries(formData), published: formData.get("published") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, date, time, place, verseText, verseRef, ministry, ...data } = parsed.data;

  if (data.published) {
    const photos = await db.postPhoto.count({ where: { postId: id } });
    const missing: Record<string, string[]> = {};
    if (data.excerpt.length < 10) missing.excerpt = ["Un résumé est nécessaire pour publier"];
    if (data.body.length < 20) missing.body = ["Le récit est trop court pour publier"];
    if (photos === 0) missing.published = ["Ajoutez au moins une photo avant de publier"];
    if (Object.keys(missing).length) return { errors: missing, values: keepValues(formData) };
  }

  const current = await db.post.findUniqueOrThrow({ where: { id } });
  await db.post.update({
    where: { id },
    data: {
      ...data,
      // L'adresse suit le titre tant que l'article n'a jamais été publié
      slug: !current.published && current.title !== data.title ? await uniqueSlug(data.title, id) : current.slug,
      date: date ? churchDateTime(date, "12:00") : null,
      time: time || null,
      place: place || null,
      verseText: verseText || null,
      verseRef: verseRef || null,
      ministry: ministry || null,
    },
  });
  refresh();
  return { ok: true, message: data.published ? "Article enregistré et publié." : "Brouillon enregistré." };
}

export async function deletePost(id: string) {
  await requireRole("RESPONSABLE");
  const photos = await db.postPhoto.findMany({ where: { postId: id }, select: { mediaId: true } });
  await db.post.delete({ where: { id } });
  await db.media.deleteMany({ where: { id: { in: photos.map((p) => p.mediaId) } } });
  refresh();
  redirect("/admin/blog");
}

/** Reçoit une photo (déjà réduite par le navigateur), la retouche et l'ajoute à l'article. */
export async function uploadPostPhoto(postId: string, formData: FormData) {
  const user = await requireRole("RESPONSABLE");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, message: "Aucune photo reçue" };
  if (!(await db.post.findUnique({ where: { id: postId } }))) return { ok: false as const, message: "Article introuvable" };
  try {
    const media = await saveMedia(Buffer.from(await file.arrayBuffer()), user.id);
    const last = await db.postPhoto.findFirst({ where: { postId }, orderBy: { order: "desc" } });
    await db.postPhoto.create({ data: { postId, mediaId: media.id, order: (last?.order ?? -1) + 1 } });
    await db.post.updateMany({ where: { id: postId, coverId: null }, data: { coverId: media.id } });
    refresh();
    return { ok: true as const, src: mediaUrl(media.id) };
  } catch (e) {
    return { ok: false as const, message: e instanceof Error ? e.message : "Photo illisible" };
  }
}

export async function updatePhotoCaption(photoId: string, caption: string) {
  await requireRole("RESPONSABLE");
  await db.postPhoto.update({ where: { id: photoId }, data: { caption: caption.trim().slice(0, 200) } });
  refresh();
}

export async function setPostCover(postId: string, mediaId: string) {
  await requireRole("RESPONSABLE");
  await db.post.update({ where: { id: postId }, data: { coverId: mediaId } });
  refresh();
}

export async function movePhoto(photoId: string, direction: -1 | 1) {
  await requireRole("RESPONSABLE");
  const photo = await db.postPhoto.findUniqueOrThrow({ where: { id: photoId } });
  const list = await db.postPhoto.findMany({ where: { postId: photo.postId }, orderBy: { order: "asc" } });
  const i = list.findIndex((p) => p.id === photoId);
  const j = i + direction;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.$transaction(list.map((p, order) => db.postPhoto.update({ where: { id: p.id }, data: { order } })));
  refresh();
}

export async function deletePhoto(photoId: string) {
  await requireRole("RESPONSABLE");
  const photo = await db.postPhoto.findUniqueOrThrow({ where: { id: photoId }, include: { post: true } });
  await db.postPhoto.delete({ where: { id: photoId } });
  await db.media.delete({ where: { id: photo.mediaId } });
  if (photo.post.coverId === photo.mediaId) {
    const first = await db.postPhoto.findFirst({ where: { postId: photo.postId }, orderBy: { order: "asc" } });
    await db.post.update({ where: { id: photo.postId }, data: { coverId: first?.mediaId ?? null } });
  }
  // Un article sans photo ne peut rester publié
  if ((await db.postPhoto.count({ where: { postId: photo.postId } })) === 0) {
    await db.post.update({ where: { id: photo.postId }, data: { published: false } });
  }
  refresh();
}
