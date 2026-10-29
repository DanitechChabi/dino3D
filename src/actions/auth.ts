"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { hasRole } from "@/lib/dal";
import { tooManyAttempts, resetAttempts } from "@/lib/rate-limit";
import { phoneSchema, passwordSchema, keepValues, type FormState } from "@/lib/validation";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Prénom requis").max(60),
    lastName: z.string().trim().min(2, "Nom requis").max(60),
    phone: phoneSchema,
    email: z.union([z.literal(""), z.email("E-mail invalide")]).optional(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Les mots de passe ne correspondent pas", path: ["confirm"] });

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { firstName, lastName, phone, email, password } = parsed.data;

  const exists = await db.user.findFirst({ where: { OR: [{ phone }, ...(email ? [{ email }] : [])] } });
  if (exists) return { message: "Un compte existe déjà avec ce numéro ou cet e-mail.", values: keepValues(formData) };

  const user = await db.user.create({
    data: { firstName, lastName, phone, email: email || null, passwordHash: await bcrypt.hash(password, 12) },
  });
  await createSession({ userId: user.id, role: user.role });
  redirect("/espace-membre");
}

const loginSchema = z.object({ phone: phoneSchema, password: z.string().min(1, "Mot de passe requis"), suite: z.string().optional() });

/** N'accepte qu'un chemin interne (évite les redirections vers un site externe). */
function safeNext(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : null;
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData) };
  const { phone, password, suite } = parsed.data;

  if (tooManyAttempts(`login:${phone}`)) {
    return { message: "Trop de tentatives. Réessayez dans 15 minutes.", values: keepValues(formData) };
  }

  const user = await db.user.findUnique({ where: { phone } });
  const valid = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) return { message: "Numéro ou mot de passe incorrect.", values: keepValues(formData) };

  resetAttempts(`login:${phone}`);
  await createSession({ userId: user.id, role: user.role });
  const next = safeNext(suite);
  if (next?.startsWith("/admin") && !hasRole(user.role, "RESPONSABLE")) redirect("/espace-membre");
  redirect(next ?? (hasRole(user.role, "RESPONSABLE") ? "/admin" : "/espace-membre"));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
