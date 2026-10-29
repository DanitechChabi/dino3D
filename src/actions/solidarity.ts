"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole, requireUser } from "@/lib/dal";
import { slugify } from "@/lib/events";
import { churchDateTime } from "@/lib/time";
import { notify } from "@/lib/notify";
import { MAX_AMOUNT, formatXOF } from "@/lib/money";
import { keepValues, normalizePhone, type FormState } from "@/lib/validation";

const visibility = z.enum(["PUBLIC", "MEMBERS", "ANONYMOUS"]);

function uniqueSlug(text: string) {
  return `${slugify(text).slice(0, 50)}-${randomBytes(3).toString("hex")}`;
}

function refresh() {
  revalidatePath("/solidarite", "layout");
  revalidatePath("/admin/solidarite", "layout");
  revalidatePath("/");
}

// ——— Demande d'aide (membre connecté) ———

const requestSchema = z.object({
  forSelf: z.enum(["oui", "non"]),
  beneficiaryName: z.string().trim().max(100).optional(),
  reason: z.string().trim().min(2).max(40),
  story: z.string().trim().min(20, "Expliquez la situation en quelques phrases (20 caractères minimum)").max(3000),
  estimate: z.union([z.literal(""), z.coerce.number().int().min(0).max(MAX_AMOUNT)]).optional(),
  visibility,
  contactPhone: z.string().trim().max(30).optional(),
});

export async function requestHelp(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { forSelf, beneficiaryName, reason, story, estimate, visibility: vis, contactPhone } = parsed.data;
  const self = forSelf === "oui";
  const name = self ? `${user.firstName} ${user.lastName}` : beneficiaryName;
  if (!name || name.length < 2) return { errors: { beneficiaryName: ["Indiquez le nom de la personne à aider"] }, values: keepValues(formData) };

  await db.solidarityCase.create({
    data: {
      slug: uniqueSlug(`${reason} ${name}`),
      title: `${reason} — soutien à ${name}`,
      reason,
      beneficiaryName: name,
      story: estimate ? `${story}\n\nBesoin estimé : ${formatXOF(estimate)}.` : story,
      visibility: vis,
      forSelf: self,
      contactPhone: contactPhone ? normalizePhone(contactPhone) : user.phone,
      requestedById: user.id,
    },
  });
  refresh();
  return { ok: true, message: "Votre demande a été transmise en toute confidentialité au pasteur et au trésorier. Vous serez recontacté(e). Que Dieu vous fortifie." };
}

// ——— Validation et suivi (pasteur / trésorier) ———

const reviewSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(5, "Titre requis").max(150),
  beneficiaryName: z.string().trim().min(2).max(100),
  reason: z.string().trim().min(2).max(40),
  story: z.string().trim().min(20, "Texte trop court").max(4000),
  goal: z.union([z.literal(""), z.coerce.number().int().min(1000, "Objectif minimum : 1 000 F").max(MAX_AMOUNT)]).optional(),
  deadline: z.union([z.literal(""), z.iso.date("Date invalide")]).optional(),
  visibility,
  decision: z.enum(["publier", "enregistrer"]),
});

export async function reviewCase(_prev: FormState, formData: FormData): Promise<FormState> {
  const reviewer = await requireRole("TRESORIER");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { id, decision, goal, deadline, ...data } = parsed.data;
  const current = await db.solidarityCase.findUnique({ where: { id } });
  if (!current) return { message: "Collecte introuvable." };

  const fields = { ...data, goal: goal === "" || goal === undefined ? null : goal, deadline: deadline ? churchDateTime(deadline, "23:59") : null };
  const publish = decision === "publier" && current.status === "PROPOSED";
  await db.solidarityCase.update({
    where: { id },
    data: { ...fields, ...(publish ? { status: "OPEN", reviewedById: reviewer.id, reviewedAt: new Date() } : {}) },
  });
  if (publish) {
    await db.financeLog.create({ data: { action: "collecte_ouverte", details: data.title, userId: reviewer.id } });
  }
  refresh();
  return { ok: true, message: publish ? "Collecte publiée." : "Modifications enregistrées." };
}

const closeSchema = z.object({ id: z.string().min(1), thanksMessage: z.string().trim().max(1500).optional(), notify: z.boolean() });

export async function closeCase(_prev: FormState, formData: FormData): Promise<FormState> {
  const reviewer = await requireRole("TRESORIER");
  const parsed = closeSchema.safeParse({ ...Object.fromEntries(formData), notify: formData.get("notify") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const c = await db.solidarityCase.update({
    where: { id: parsed.data.id },
    data: { status: "CLOSED", closedAt: new Date(), thanksMessage: parsed.data.thanksMessage || null },
  });
  await db.financeLog.create({ data: { action: "collecte_close", details: c.title, userId: reviewer.id } });
  let sent = -1;
  if (parsed.data.notify && c.visibility !== "MEMBERS") {
    const r = await notify("news", { title: "Merci pour votre générosité 🙏", body: `La collecte « ${c.title} » est terminée.`, url: `/solidarite/${c.slug}` });
    if (!r.skipped) sent = r.sent;
  }
  refresh();
  // Le formulaire disparaît une fois la collecte close : la confirmation s'affiche sur la page
  redirect(`/admin/solidarite/${c.id}?cloturee=${sent}`);
}

const payoutSchema = z.object({
  caseId: z.string().min(1),
  amount: z.coerce.number().int().min(1, "Montant requis").max(MAX_AMOUNT),
  paidAt: z.iso.date("Date invalide"),
  note: z.string().trim().max(300).optional(),
});

export async function recordPayout(_prev: FormState, formData: FormData): Promise<FormState> {
  const treasurer = await requireRole("TRESORIER");
  const parsed = payoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { caseId, amount, paidAt, note } = parsed.data;
  const c = await db.solidarityCase.findUnique({ where: { id: caseId } });
  if (!c || !["OPEN", "CLOSED"].includes(c.status)) return { message: "Collecte introuvable." };
  await db.solidarityPayout.create({ data: { caseId, amount, paidAt: churchDateTime(paidAt, "12:00"), note: note || null, recordedById: treasurer.id } });
  await db.financeLog.create({ data: { action: "aide_versee", details: `${c.title} · ${formatXOF(amount)}`, userId: treasurer.id } });
  refresh();
  return { ok: true, message: `Versement de ${formatXOF(amount)} enregistré.` };
}

/** Classe une demande sans suite (elle reste consultable dans l'administration). */
export async function rejectCase(id: string) {
  const reviewer = await requireRole("TRESORIER");
  await db.solidarityCase.updateMany({ where: { id, status: "PROPOSED" }, data: { status: "REJECTED", reviewedById: reviewer.id, reviewedAt: new Date() } });
  refresh();
  redirect("/admin/solidarite");
}

export async function reopenCase(id: string) {
  await requireRole("TRESORIER");
  await db.solidarityCase.update({ where: { id }, data: { status: "OPEN", closedAt: null } });
  refresh();
  redirect(`/admin/solidarite/${id}`);
}
