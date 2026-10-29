"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { getProvider, newReference, refreshDonation, settleDonation } from "@/lib/payments";
import { tooManyAttempts } from "@/lib/rate-limit";
import { MAX_AMOUNT, MIN_AMOUNT, formatXOF } from "@/lib/money";
import { isAcceptingGifts } from "@/lib/solidarity";
import { keepValues, normalizePhone, type FormState } from "@/lib/validation";

const schema = z.object({
  categoryId: z.string().optional(),
  solidarityId: z.string().optional(),
  amount: z.coerce.number().int("Montant entier en F CFA").min(MIN_AMOUNT, `Montant minimum : ${formatXOF(MIN_AMOUNT)}`).max(MAX_AMOUNT, "Montant trop élevé"),
  method: z.enum(["MOBILE_MONEY", "CARD"]),
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  anonymous: z.boolean(),
  note: z.string().trim().max(300).optional(),
});

async function origin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function startDonation(_prev: FormState, formData: FormData): Promise<FormState> {
  const provider = getProvider();
  if (!provider) return { message: "Le paiement en ligne n'est pas encore activé. Merci de donner au temple pendant le culte." };

  const parsed = schema.safeParse({ ...Object.fromEntries(formData), anonymous: formData.get("anonymous") === "on" });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { amount, method, anonymous, note, solidarityId } = parsed.data;

  const user = await getCurrentUser();
  const name = parsed.data.name || (user ? `${user.firstName} ${user.lastName}` : "");
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : user?.phone;
  if (!name) return { errors: { name: ["Indiquez votre nom"] }, values: keepValues(formData) };
  if (method === "MOBILE_MONEY" && (!phone || !/^\+?\d{8,15}$/.test(phone))) {
    return { errors: { phone: ["Numéro Mobile Money requis"] }, values: keepValues(formData) };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (tooManyAttempts(`don:${ip}`, 15)) return { message: "Trop de tentatives. Réessayez dans quelques minutes.", values: keepValues(formData) };

  // Don à une collecte de solidarité, ou don classique
  let caseRow: { id: string; title: string } | null = null;
  let category;
  if (solidarityId) {
    const c = await db.solidarityCase.findUnique({ where: { id: solidarityId } });
    if (!c || !isAcceptingGifts(c) || (c.visibility === "MEMBERS" && !user)) {
      return { message: "Cette collecte n'accepte plus de dons.", values: keepValues(formData) };
    }
    caseRow = c;
    category = await db.givingCategory.findUnique({ where: { slug: "solidarite" } });
  } else {
    category = await db.givingCategory.findFirst({ where: { id: parsed.data.categoryId, active: true } });
  }
  if (!category) return { errors: { categoryId: ["Choisissez un type de don"] }, values: keepValues(formData) };
  const categoryId = category.id;

  const reference = newReference();
  await db.donation.create({
    data: { reference, categoryId, solidarityId: caseRow?.id, amount, method, anonymous, note: note || null, userId: user?.id, donorName: name, donorPhone: phone ?? null, provider: provider.id },
  });

  const base = await origin();
  let next: string;
  try {
    const res = await provider.start({
      reference,
      amount,
      method,
      description: caseRow ? `Solidarité : ${caseRow.title}` : `${category.name} — EBB-JR Tanmey`,
      customer: { name, phone },
      returnUrl: `${base}/donner/merci/${reference}`,
      webhookUrl: `${base}/api/paiements/notification/${provider.id}`,
    });
    if (res.providerRef) await db.donation.update({ where: { reference }, data: { providerRef: res.providerRef } });
    next = res.kind === "redirect" ? res.url : `/donner/merci/${reference}`;
  } catch (e) {
    await settleDonation(reference, "FAILED");
    console.error("Échec du démarrage du paiement", e);
    return { message: "Le service de paiement est momentanément indisponible. Réessayez plus tard.", values: keepValues(formData) };
  }
  redirect(next);
}

/** Interrogé par la page de confirmation tant que le paiement est en attente. */
export async function checkDonation(reference: string) {
  return refreshDonation(reference);
}

/** Page de test : simule la réponse du fournisseur. Refusé si le mode test n'est pas actif. */
export async function simulatePayment(reference: string, outcome: "SUCCEEDED" | "FAILED" | "CANCELLED") {
  if (getProvider()?.id !== "simulation") throw new Error("Mode test inactif");
  const d = await db.donation.findUnique({ where: { reference } });
  if (!d || d.provider !== "simulation") throw new Error("Don introuvable");
  await settleDonation(reference, outcome, `SIM-${reference}`);
  redirect(`/donner/merci/${reference}`);
}
