"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { passwordSchema, keepValues, type FormState } from "@/lib/validation";

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  email: z.union([z.literal(""), z.email("E-mail invalide")]).optional(),
  birthDate: z.union([z.literal(""), z.iso.date("Date invalide")]).optional(),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { email, birthDate, ...rest } = parsed.data;

  if (email) {
    const taken = await db.user.findFirst({ where: { email, NOT: { id: user.id } } });
    if (taken) return { errors: { email: ["Cet e-mail est déjà utilisé"] }, values: keepValues(formData) };
  }
  await db.user.update({
    where: { id: user.id },
    data: { ...rest, email: email || null, birthDate: birthDate ? new Date(birthDate) : null },
  });
  revalidatePath("/espace-membre");
  return { ok: true, message: "Profil mis à jour." };
}

const passwordChangeSchema = z
  .object({ current: z.string().min(1, "Requis"), password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe ne correspondent pas", path: ["confirm"] });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };

  const row = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await bcrypt.compare(parsed.data.current, row.passwordHash))) {
    return { errors: { current: ["Mot de passe actuel incorrect"] } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
  return { ok: true, message: "Mot de passe modifié." };
}

export async function toggleMinistry(ministryId: string) {
  const user = await requireUser();
  const key = { userId_ministryId: { userId: user.id, ministryId } };
  const existing = await db.ministryMember.findUnique({ where: key });
  if (existing) {
    await db.ministryMember.delete({ where: key });
  } else {
    await db.ministryMember.create({ data: { userId: user.id, ministryId } });
  }
  revalidatePath("/espace-membre");
}
