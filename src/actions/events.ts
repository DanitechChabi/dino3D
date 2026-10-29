"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { phoneSchema, keepValues, type FormState } from "@/lib/validation";

const schema = z.object({
  eventId: z.string().min(1),
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  phone: phoneSchema,
  guests: z.coerce.number().int().min(0).max(10).default(0),
});

export async function registerToEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { eventId, name, phone, guests } = parsed.data;

  const event = await db.event.findUnique({ where: { id: eventId }, include: { registrations: { select: { guests: true } } } });
  if (!event || !event.published || !event.registrationOpen || event.startAt < new Date()) {
    return { message: "Les inscriptions ne sont pas ouvertes pour cet événement." };
  }
  if (event.capacity) {
    const taken = event.registrations.reduce((n, r) => n + 1 + r.guests, 0);
    if (taken + 1 + guests > event.capacity) {
      return { message: `Désolé, il ne reste que ${Math.max(0, event.capacity - taken)} place(s).`, values: keepValues(formData) };
    }
  }

  const user = await getCurrentUser();
  const existing = await db.eventRegistration.findUnique({ where: { eventId_phone: { eventId, phone } } });
  if (existing) return { ok: true, message: "Vous êtes déjà inscrit(e) à cet événement. À bientôt !" };

  await db.eventRegistration.create({ data: { eventId, name, phone, guests, userId: user?.id } });
  revalidatePath(`/evenements/${event.slug}`);
  revalidatePath("/espace-membre");
  return { ok: true, message: `Inscription confirmée${guests ? ` (vous + ${guests} accompagnant${guests > 1 ? "s" : ""})` : ""}. Que Dieu vous bénisse !` };
}

export async function cancelRegistration(registrationId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.eventRegistration.deleteMany({ where: { id: registrationId, userId: user.id } });
  revalidatePath("/espace-membre");
}
