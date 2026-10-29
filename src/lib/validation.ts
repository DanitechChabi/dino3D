import { z } from "zod";

/** Normalise un numéro : garde le « + » initial et les chiffres. */
export function normalizePhone(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((v) => /^\+?\d{8,15}$/.test(v), "Numéro de téléphone invalide");

export const passwordSchema = z.string().min(8, "8 caractères minimum").max(100);

export type FormState =
  | { ok?: boolean; message?: string; errors?: Record<string, string[] | undefined>; values?: Record<string, string> }
  | undefined;

/**
 * Valeurs saisies renvoyées au formulaire en cas d'erreur : React réinitialise le formulaire
 * après l'action, on les réinjecte via defaultValue. Les mots de passe ne sont jamais renvoyés.
 */
export function keepValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [k, v] of formData) {
    if (typeof v === "string" && !/password|confirm|current|^\$ACTION/i.test(k)) values[k] = v;
  }
  return values;
}
