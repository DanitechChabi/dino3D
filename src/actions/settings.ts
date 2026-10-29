"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { SETTING_KEYS } from "@/lib/settings";
import { keepValues, type FormState } from "@/lib/validation";

const url = (host: RegExp, message: string) =>
  z.union([z.literal(""), z.url(message).refine((v) => host.test(new URL(v).hostname), message)]);

const schema = z.object({
  address: z.string().trim().min(3, "Adresse requise").max(200),
  // Coordonnées « 6.4969, 2.6289 » ou nom de lieu reconnu par Google Maps
  mapQuery: z.string().trim().max(200),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || /^\d{10,15}$/.test(v), "Numéro au format international, ex. 229 01 97 60 97 49"),
  facebook: url(/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "Lien Facebook invalide"),
  youtube: url(/(^|\.)youtube\.com$|^youtu\.be$/, "Lien YouTube invalide"),
  whatsappChannel: url(/(^|\.)whatsapp\.com$/, "Lien de chaîne WhatsApp invalide"),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  await db.$transaction(
    SETTING_KEYS.map((key) => db.setting.upsert({ where: { key }, create: { key, value: parsed.data[key] }, update: { value: parsed.data[key] } })),
  );
  revalidatePath("/", "layout");
  return { ok: true, message: "Paramètres enregistrés : le site est à jour." };
}
