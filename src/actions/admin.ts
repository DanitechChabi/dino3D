"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { keepValues, type FormState } from "@/lib/validation";
import { notify } from "@/lib/notify";
import { runReminders } from "@/lib/reminders";
import { programFromText, slugify } from "@/lib/events";
import { formatDay, formatTime, fromLocalInput } from "@/lib/time";

// ——— Membres (pasteur / administrateur uniquement) ———

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireRole("ADMIN");
  if (userId === admin.id) return; // on ne modifie pas son propre rôle (évite de perdre l'accès)
  await db.user.update({ where: { id: userId }, data: { role: z.enum(Role).parse(role) } });
  revalidatePath("/admin/membres");
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireRole("ADMIN");
  if (userId === admin.id) return;
  await db.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/membres");
}

// ——— Cultes et réunions (administrateur) ———

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nom requis").max(80),
  description: z.string().trim().max(300).optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide"),
  endTime: z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide")]).optional(),
  location: z.string().trim().min(2, "Lieu requis").max(100),
  order: z.coerce.number().int().min(0).max(99).default(0),
  weeks: z.array(z.coerce.number().int().min(1).max(5)).max(5),
  ministryId: z.string().optional(),
  reminders: z.boolean(),
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("ADMIN");
  const parsed = serviceSchema.safeParse({ ...Object.fromEntries(formData), weeks: formData.getAll("weeks"), reminders: formData.get("reminders") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, endTime, description, weeks, ministryId, ...data } = parsed.data;
  // Les 5 semaines cochées reviennent à « chaque semaine »
  const row = { ...data, weeks: weeks.length === 5 ? [] : [...new Set(weeks)].sort(), ministryId: ministryId || null, endTime: endTime || null, description: description || null };
  if (id) await db.service.update({ where: { id }, data: row });
  else await db.service.create({ data: row });
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Rendez-vous mis à jour." : "Rendez-vous ajouté." };
}

export async function deleteService(id: string) {
  await requireRole("ADMIN");
  await db.service.delete({ where: { id } });
  revalidatePath("/", "layout");
}

// ——— Annonces (responsables et plus) ———

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Titre requis").max(150),
  body: z.string().trim().min(5, "Texte requis").max(5000),
  pinned: z.boolean(),
  published: z.boolean(),
  notify: z.boolean(),
});

export async function saveAnnouncement(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("RESPONSABLE");
  const parsed = announcementSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned") === "on",
    published: formData.get("published") === "on",
    notify: formData.get("notify") === "on",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, notify: shouldNotify, ...data } = parsed.data;
  if (id) await db.announcement.update({ where: { id }, data });
  else await db.announcement.create({ data: { ...data, authorId: user.id } });
  revalidatePath("/", "layout");
  let message = id ? "Annonce mise à jour." : "Annonce publiée.";
  if (shouldNotify && data.published) {
    const r = await notify("news", { title: data.title, body: data.body.slice(0, 160), url: "/annonces" });
    message += r.skipped ? " (Notifications non configurées sur le serveur.)" : ` Notification envoyée à ${r.sent} appareil(s).`;
  }
  return { ok: true, message };
}

export async function deleteAnnouncement(id: string) {
  await requireRole("RESPONSABLE");
  await db.announcement.delete({ where: { id } });
  revalidatePath("/", "layout");
}

// ——— Messages ———

export async function setMessageHandled(id: string, handled: boolean) {
  const user = await requireRole("RESPONSABLE");
  const msg = await db.contactMessage.findUniqueOrThrow({ where: { id } });
  // Les demandes de prière sont confidentielles : réservées au pasteur
  if (msg.isPrayer && user.role !== "ADMIN") return;
  await db.contactMessage.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

// ——— Événements (responsables et plus) ———

const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Titre requis").max(150),
  category: z.string().trim().min(2).max(50),
  summary: z.string().trim().min(10, "Résumé trop court").max(300),
  description: z.string().trim().max(8000).default(""),
  location: z.string().trim().min(2, "Lieu requis").max(150),
  startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date de début invalide"),
  endAt: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date de fin invalide")]).optional(),
  coverUrl: z.union([z.literal(""), z.string().regex(/^(\/|https:\/\/)\S+$/, "Lien d'image invalide")]).optional(),
  program: z.string().max(4000).default(""),
  capacity: z.union([z.literal(""), z.coerce.number().int().min(1).max(100000)]).optional(),
  ministryId: z.string().optional(),
  articleSlug: z.string().max(100).optional(),
  registrationOpen: z.boolean(),
  published: z.boolean(),
  notify: z.boolean(),
});

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("RESPONSABLE");
  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.safeParse({
    ...raw,
    registrationOpen: raw.registrationOpen === "on",
    published: raw.published === "on",
    notify: raw.notify === "on",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, startAt, endAt, coverUrl, program, capacity, ministryId, articleSlug, notify: shouldNotify, ...rest } = parsed.data;

  const start = fromLocalInput(startAt);
  const end = endAt ? fromLocalInput(endAt) : null;
  if (end && end <= start) return { errors: { endAt: ["La fin doit être après le début"] }, values: keepValues(formData) };

  const data = {
    ...rest,
    startAt: start,
    endAt: end,
    coverUrl: coverUrl || null,
    program: programFromText(program),
    capacity: capacity === "" || capacity === undefined ? null : capacity,
    ministryId: ministryId || null,
    articleSlug: articleSlug || null,
  };

  let slug: string;
  if (id) {
    slug = (await db.event.update({ where: { id }, data })).slug;
  } else {
    // Adresse lisible et unique : titre + date
    const base = slugify(`${rest.title} ${startAt.slice(0, 10)}`) || "evenement";
    slug = base;
    for (let i = 2; await db.event.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    await db.event.create({ data: { ...data, slug } });
  }

  let message = id ? "Événement mis à jour." : "Événement créé.";
  if (shouldNotify && rest.published) {
    const r = await notify("events", { title: `Nouvel événement : ${rest.title}`, body: `${formatDay(start)} à ${formatTime(start)} · ${rest.location}`, url: `/evenements/${slug}` });
    message += r.skipped ? " (Notifications non configurées sur le serveur.)" : ` Notification envoyée à ${r.sent} appareil(s).`;
  }
  revalidatePath("/", "layout");
  return { ok: true, message };
}

export async function deleteEvent(id: string) {
  await requireRole("RESPONSABLE");
  await db.event.delete({ where: { id } });
  revalidatePath("/", "layout");
}

// ——— Notifications manuelles (pasteur / administrateur) ———

const broadcastSchema = z.object({
  audience: z.enum(["services", "events", "news"]),
  title: z.string().trim().min(3, "Titre requis").max(80),
  body: z.string().trim().min(3, "Message requis").max(200),
  url: z.union([z.literal(""), z.string().regex(/^\/\S*$/, "Adresse interne commençant par /")]).optional(),
});

export async function sendBroadcast(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("ADMIN");
  const parsed = broadcastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { audience, url, ...notice } = parsed.data;
  const r = await notify(audience, { ...notice, url: url || "/" });
  if (r.skipped) return { message: "Les notifications ne sont pas encore configurées sur le serveur (clés VAPID).", values: keepValues(formData) };
  return { ok: true, message: `Notification envoyée à ${r.sent} appareil(s)${r.failed ? `, ${r.failed} échec(s)` : ""}.` };
}

export async function runRemindersNow() {
  await requireRole("ADMIN");
  return runReminders();
}
