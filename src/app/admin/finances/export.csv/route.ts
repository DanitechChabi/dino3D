import { db } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/dal";
import { canSeeConfidential, filtersWhere, parseFilters } from "@/lib/finance";
import { METHOD_LABELS, STATUS_LABELS } from "@/lib/money";

// Export des dons filtrés au format CSV (Excel).
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, "TRESORIER")) return new Response("Non autorisé", { status: 403 });
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const f = parseFilters(sp);
  const donations = await db.donation.findMany({ where: filtersWhere(f), orderBy: { createdAt: "asc" }, include: { category: true } });
  const seeAll = canSeeConfidential(user.role);

  const cell = (v: string | number) => {
    const s = String(v);
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Date", "Type", "Donateur", "Téléphone", "Moyen", "Montant (F CFA)", "État", "Référence", "Note"],
    ...donations.map((d) => {
      const hidden = d.category.confidential && !seeAll;
      return [
        (d.paidAt ?? d.createdAt).toLocaleDateString("fr-FR", { timeZone: "Africa/Porto-Novo" }),
        d.category.name,
        hidden ? "Confidentiel" : d.anonymous && !seeAll ? "Anonyme" : (d.donorName ?? ""),
        hidden || (d.anonymous && !seeAll) ? "" : (d.donorPhone ?? ""),
        METHOD_LABELS[d.method],
        d.amount,
        STATUS_LABELS[d.status],
        d.reference,
        hidden ? "" : (d.note ?? ""),
      ];
    }),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="dons-${f.from}-${f.to}.csv"` } });
}
