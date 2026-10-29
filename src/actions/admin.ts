"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { keepValues, type FormState } from "@/lib/validation";

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
});

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("ADMIN");
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, endTime, description, ...data } = parsed.data;
  const row = { ...data, endTime: endTime || null, description: description || null };
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
});

export async function saveAnnouncement(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("RESPONSABLE");
  const parsed = announcementSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned") === "on",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, ...data } = parsed.data;
  if (id) await db.announcement.update({ where: { id }, data });
  else await db.announcement.create({ data: { ...data, authorId: user.id } });
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Annonce mise à jour." : "Annonce publiée." };
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
