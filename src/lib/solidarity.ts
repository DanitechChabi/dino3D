import "server-only";
import type { Prisma, Role, SolidarityCase } from "@prisma/client";
import { db } from "./db";
import { hasRole } from "./dal";

export const SOLIDARITY_REASONS = ["Maladie", "Deuil", "Mariage", "Naissance", "Scolarité", "Logement", "Autre"];

export const VISIBILITY_LABELS = {
  PUBLIC: "Publique",
  MEMBERS: "Réservée aux membres",
  ANONYMOUS: "Bénéficiaire anonyme",
} as const;

/** Le pasteur et le trésorier valident et suivent les collectes. */
export function canReview(role?: Role | null) {
  return !!role && hasRole(role, "TRESORIER");
}

/** Collectes visibles pour un visiteur ou un membre connecté. */
export function visibleWhere(isMember: boolean): Prisma.SolidarityCaseWhereInput {
  return { status: { in: ["OPEN", "CLOSED"] }, ...(isMember ? {} : { visibility: { not: "MEMBERS" } }) };
}

/** Nom affiché du bénéficiaire, masqué pour une collecte anonyme. */
export function beneficiaryLabel(c: Pick<SolidarityCase, "visibility" | "beneficiaryName">, staff: boolean) {
  if (c.visibility === "ANONYMOUS" && !staff) return "Un membre de notre famille d'église";
  return c.beneficiaryName;
}

/** Montants collectés, nombre de donateurs et aides versées, par collecte. */
export async function caseTotals(ids: string[]) {
  if (ids.length === 0) return new Map<string, { raised: number; donors: number; paidOut: number }>();
  const [raised, payouts] = await Promise.all([
    db.donation.groupBy({ by: ["solidarityId"], where: { solidarityId: { in: ids }, status: "SUCCEEDED" }, _sum: { amount: true }, _count: true }),
    db.solidarityPayout.groupBy({ by: ["caseId"], where: { caseId: { in: ids } }, _sum: { amount: true } }),
  ]);
  return new Map(
    ids.map((id) => {
      const r = raised.find((x) => x.solidarityId === id);
      return [id, { raised: r?._sum.amount ?? 0, donors: r?._count ?? 0, paidOut: payouts.find((p) => p.caseId === id)?._sum.amount ?? 0 }];
    }),
  );
}

/** Une collecte accepte-t-elle encore des dons ? */
export function isAcceptingGifts(c: Pick<SolidarityCase, "status" | "deadline">) {
  return c.status === "OPEN" && (!c.deadline || c.deadline > new Date());
}
