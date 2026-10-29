import "server-only";
import type { DonationStatus, PaymentMethod, Prisma, Role } from "@prisma/client";
import { db } from "./db";
import { churchDateTime, churchParts } from "./time";

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** Seul le trésorier voit l'identité des donateurs des dons confidentiels (dîmes). */
export function canSeeConfidential(role: Role) {
  return role === "TRESORIER";
}

export type Filters = { from: string; to: string; category?: string; status?: DonationStatus; method?: PaymentMethod };

/** Filtres de la liste des dons, à partir des paramètres de l'adresse (mois en cours par défaut). */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const today = churchParts(new Date()).day;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const date = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const status = str("statut");
  const method = str("moyen");
  return {
    from: date(str("du")) ?? `${today.slice(0, 7)}-01`,
    to: date(str("au")) ?? today,
    category: str("type") || undefined,
    status: (["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"] as const).find((s) => s === status) ?? "SUCCEEDED",
    method: (["MOBILE_MONEY", "CARD", "CASH", "TRANSFER"] as const).find((m) => m === method),
  };
}

export function filtersWhere(f: Filters): Prisma.DonationWhereInput {
  const range = { gte: churchDateTime(f.from, "00:00"), lte: churchDateTime(f.to, "23:59") };
  return {
    ...(f.status ? { status: f.status } : {}),
    ...(f.category ? { categoryId: f.category } : {}),
    ...(f.method ? { method: f.method } : {}),
    ...(f.status === "SUCCEEDED" ? { paidAt: range } : { createdAt: range }),
  };
}

/** Indicateurs du tableau de bord du trésorier. */
export async function financeOverview() {
  const now = new Date();
  const today = churchParts(now).day;
  const startOf = (day: string) => churchDateTime(day, "00:00");
  const sum = async (from: Date) =>
    (await db.donation.aggregate({ where: { status: "SUCCEEDED", paidAt: { gte: from } }, _sum: { amount: true }, _count: true }));

  const yearStart = startOf(`${today.slice(0, 4)}-01-01`);
  const twelve = new Date(startOf(`${today.slice(0, 7)}-01`));
  twelve.setMonth(twelve.getMonth() - 11);

  const [d, m, y, pending, recent, categories, byMethod] = await Promise.all([
    sum(startOf(today)),
    sum(startOf(`${today.slice(0, 7)}-01`)),
    sum(yearStart),
    db.donation.count({ where: { status: "PENDING" } }),
    db.donation.findMany({ where: { status: "SUCCEEDED", paidAt: { gte: twelve } }, select: { amount: true, paidAt: true } }),
    db.givingCategory.findMany({ orderBy: { order: "asc" } }),
    db.donation.groupBy({ by: ["method"], where: { status: "SUCCEEDED", paidAt: { gte: yearStart } }, _sum: { amount: true } }),
  ]);

  // 12 derniers mois
  const monthly: { key: string; label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({ key, label: `${MONTHS[dt.getMonth()]} ${String(dt.getFullYear()).slice(2)}`, total: 0 });
  }
  for (const r of recent) {
    const key = churchParts(r.paidAt!).day.slice(0, 7);
    const slot = monthly.find((x) => x.key === key);
    if (slot) slot.total += r.amount;
  }

  const byCategoryRaw = await db.donation.groupBy({ by: ["categoryId"], where: { status: "SUCCEEDED", paidAt: { gte: yearStart } }, _sum: { amount: true } });
  const byCategory = categories
    .map((c) => ({ label: c.name, total: byCategoryRaw.find((r) => r.categoryId === c.id)?._sum.amount ?? 0 }))
    .sort((a, b) => b.total - a.total);

  return {
    today: { total: d._sum.amount ?? 0, count: d._count },
    month: { total: m._sum.amount ?? 0, count: m._count },
    year: { total: y._sum.amount ?? 0, count: y._count },
    pending,
    monthly,
    byCategory,
    byMethod: byMethod.map((r) => ({ method: r.method, total: r._sum.amount ?? 0 })),
  };
}
