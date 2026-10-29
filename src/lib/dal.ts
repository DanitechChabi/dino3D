import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { readSession } from "./session";

const RANK: Record<Role, number> = { MEMBRE: 0, RESPONSABLE: 1, TRESORIER: 2, ADMIN: 3 };

export const ROLE_LABELS: Record<Role, string> = {
  MEMBRE: "Membre",
  RESPONSABLE: "Responsable de ministère",
  TRESORIER: "Trésorier",
  ADMIN: "Pasteur / Administrateur",
};

/** Utilisateur connecté (relu en base à chaque requête, pour tenir compte d'un rôle modifié ou d'un compte désactivé). */
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, firstName: true, lastName: true, phone: true, email: true, role: true, active: true, mustChangePassword: true },
  });
  return user?.active ? user : null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  // Mot de passe temporaire : on doit d'abord en choisir un nouveau
  if (user.mustChangePassword) redirect("/changer-mot-de-passe");
  return user;
}

export function hasRole(role: Role, min: Role) {
  return RANK[role] >= RANK[min];
}

export async function requireRole(min: Role) {
  const user = await requireUser();
  if (!hasRole(user.role, min)) redirect("/espace-membre");
  return user;
}
