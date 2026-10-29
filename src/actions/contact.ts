"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { keepValues, type FormState } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.literal(""), z.email("E-mail invalide")]).optional(),
  subject: z.string().trim().min(2, "Indiquez un sujet").max(150),
  message: z.string().trim().min(5, "Votre message est trop court").max(3000),
  isPrayer: z.boolean(),
  website: z.string().max(0).optional(), // piège à robots
});

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
    isPrayer: formData.get("isPrayer") === "on",
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };

  const { website, email, ...data } = parsed.data;
  void website;
  await db.contactMessage.create({ data: { ...data, email: email || null } });

  return {
    ok: true,
    message: data.isPrayer
      ? "Votre sujet de prière a bien été reçu. Nous prions avec vous. 🙏"
      : "Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.",
  };
}
