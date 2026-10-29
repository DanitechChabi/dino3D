"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { slugify } from "@/lib/events";
import { fromLocalInput } from "@/lib/time";
import { notify } from "@/lib/notify";
import { parseVideoUrl } from "@/lib/video";
import { keepValues, type FormState } from "@/lib/validation";

function refresh() {
  revalidatePath("/", "layout");
}

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Titre requis").max(150),
  description: z.string().trim().max(4000).default(""),
  preacher: z.string().trim().max(100).optional(),
  series: z.string().trim().max(100).optional(),
  scripture: z.string().trim().max(100).optional(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date invalide"),
  url: z.string().trim().max(500).optional(),
  status: z.enum(["SCHEDULED", "ENDED"]).optional(), // « ENDED » : ajout d'une prédication passée
  published: z.boolean(),
});

export async function saveLive(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("RESPONSABLE");
  const parsed = schema.safeParse({ ...Object.fromEntries(formData), published: formData.get("published") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, url, scheduledAt, status, preacher, series, scripture, ...rest } = parsed.data;

  let video = null;
  if (url) {
    video = parseVideoUrl(url);
    if (!video) return { errors: { url: ["Lien YouTube ou Facebook invalide (il doit commencer par https://)"] }, values: keepValues(formData) };
  }
  if (status === "ENDED" && !url) return { errors: { url: ["Le lien de la vidéo est requis pour une prédication passée"] }, values: keepValues(formData) };

  const data = {
    ...rest,
    preacher: preacher || null,
    series: series || null,
    scripture: scripture || null,
    scheduledAt: fromLocalInput(scheduledAt),
    url: url || null,
    platform: video?.platform ?? "YOUTUBE",
    videoId: video?.videoId ?? null,
  };
  if (id) {
    await db.livestream.update({ where: { id }, data });
  } else {
    await db.livestream.create({
      data: {
        ...data,
        slug: `${slugify(`${rest.title} ${scheduledAt.slice(0, 10)}`).slice(0, 70)}-${randomBytes(2).toString("hex")}`,
        ...(status === "ENDED" ? { status: "ENDED", startedAt: data.scheduledAt, endedAt: data.scheduledAt } : {}),
      },
    });
  }
  refresh();
  return { ok: true, message: id ? "Enregistré." : status === "ENDED" ? "Prédication ajoutée aux archives." : "Direct programmé." };
}

/** Lance le direct : pastille « EN DIRECT » sur tout le site et notification aux abonnés. */
export async function startLive(id: string) {
  await requireRole("RESPONSABLE");
  const live = await db.livestream.findUnique({ where: { id } });
  if (!live || !live.url) return { ok: false, message: "Ajoutez d'abord le lien YouTube ou Facebook du direct." };
  await db.livestream.update({ where: { id }, data: { status: "LIVE", startedAt: new Date() } });
  const r = await notify("services", { title: `🔴 En direct : ${live.title}`, body: "Rejoignez-nous maintenant sur le site de l'église.", url: "/direct", tag: `live:${id}` });
  refresh();
  return { ok: true, message: r.skipped ? "Direct lancé." : `Direct lancé. Notification envoyée à ${r.sent} appareil(s).` };
}

export async function endLive(id: string) {
  await requireRole("RESPONSABLE");
  await db.livestream.update({ where: { id }, data: { status: "ENDED", endedAt: new Date() } });
  refresh();
}

export async function cancelLive(id: string) {
  await requireRole("RESPONSABLE");
  await db.livestream.update({ where: { id }, data: { status: "CANCELLED" } });
  refresh();
}

export async function deleteLive(id: string) {
  await requireRole("RESPONSABLE");
  await db.livestream.delete({ where: { id } });
  refresh();
}
