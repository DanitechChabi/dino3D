"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { newReference } from "@/lib/payments";
import { churchDateTime } from "@/lib/time";
import { MAX_AMOUNT, formatXOF } from "@/lib/money";
import { keepValues, normalizePhone, type FormState } from "@/lib/validation";

const cashSchema = z.object({
  categoryId: z.string().min(1, "Choisissez un type"),
  amount: z.coerce.number().int("Montant entier").min(1, "Montant requis").max(MAX_AMOUNT),
  method: z.enum(["CASH", "TRANSFER"]),
  serviceDate: z.iso.date("Date invalide"),
  memberPhone: z.string().trim().max(30).optional(),
  donorName: z.string().trim().max(100).optional(),
  note: z.string().trim().max(300).optional(),
});

/** Saisie d'une quête ou d'un don reçu en espèces / par virement. */
export async function recordCashDonation(_prev: FormState, formData: FormData): Promise<FormState> {
  const treasurer = await requireRole("TRESORIER");
  const parsed = cashSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { categoryId, amount, method, serviceDate, memberPhone, donorName, note } = parsed.data;

  let member = null;
  if (memberPhone) {
    member = await db.user.findUnique({ where: { phone: normalizePhone(memberPhone) } });
    if (!member) return { errors: { memberPhone: ["Aucun membre avec ce numéro"] }, values: keepValues(formData) };
  }
  const category = await db.givingCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { errors: { categoryId: ["Type invalide"] }, values: keepValues(formData) };

  const reference = newReference();
  await db.donation.create({
    data: {
      reference,
      categoryId,
      amount,
      method,
      status: "SUCCEEDED",
      paidAt: churchDateTime(serviceDate, "12:00"),
      serviceDate: churchDateTime(serviceDate, "12:00"),
      userId: member?.id,
      donorName: member ? `${member.firstName} ${member.lastName}` : donorName || null,
      donorPhone: member?.phone ?? null,
      note: note || null,
      recordedById: treasurer.id,
    },
  });
  await db.financeLog.create({
    data: { action: "saisie", details: `${category.name} · ${formatXOF(amount)} · ${serviceDate} · réf. ${reference}`, userId: treasurer.id },
  });
  revalidatePath("/admin/finances", "layout");
  return { ok: true, message: `Enregistré : ${category.name}, ${formatXOF(amount)}.` };
}

/** Annule une saisie manuelle erronée (jamais supprimée : elle reste dans le journal). */
export async function cancelManualDonation(id: string) {
  const treasurer = await requireRole("TRESORIER");
  const d = await db.donation.findUnique({ where: { id }, include: { category: true } });
  if (!d || d.provider || d.status !== "SUCCEEDED") return;
  await db.donation.update({ where: { id }, data: { status: "CANCELLED" } });
  await db.financeLog.create({ data: { action: "annulation", details: `${d.category.name} · ${formatXOF(d.amount)} · réf. ${d.reference}`, userId: treasurer.id } });
  revalidatePath("/admin/finances", "layout");
}

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(60),
  description: z.string().trim().min(2, "Description requise").max(200),
  confidential: z.boolean(),
});

export async function addGivingCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("TRESORIER");
  const parsed = categorySchema.safeParse({ ...Object.fromEntries(formData), confidential: formData.get("confidential") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const slug = parsed.data.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (await db.givingCategory.findUnique({ where: { slug } })) return { errors: { name: ["Ce type existe déjà"] }, values: keepValues(formData) };
  const order = await db.givingCategory.count();
  await db.givingCategory.create({ data: { ...parsed.data, slug, order } });
  await db.financeLog.create({ data: { action: "type_ajoute", details: parsed.data.name, userId: user.id } });
  revalidatePath("/admin/finances", "layout");
  revalidatePath("/donner");
  return { ok: true, message: "Type de don ajouté." };
}

export async function toggleGivingCategory(id: string, active: boolean) {
  const user = await requireRole("TRESORIER");
  const c = await db.givingCategory.update({ where: { id }, data: { active } });
  await db.financeLog.create({ data: { action: active ? "type_active" : "type_desactive", details: c.name, userId: user.id } });
  revalidatePath("/admin/finances", "layout");
  revalidatePath("/donner");
}
