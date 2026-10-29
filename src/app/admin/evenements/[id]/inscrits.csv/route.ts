import { db } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/dal";

// Liste des inscrits au format CSV (s'ouvre dans Excel).
export async function GET(_request: Request, ctx: RouteContext<"/admin/evenements/[id]/inscrits.csv">) {
  const user = await getCurrentUser();
  if (!user || !hasRole(user.role, "RESPONSABLE")) return new Response("Non autorisé", { status: 403 });
  const { id } = await ctx.params;
  const event = await db.event.findUnique({ where: { id }, include: { registrations: { orderBy: { createdAt: "asc" } } } });
  if (!event) return new Response("Introuvable", { status: 404 });

  // Neutralise les formules (=, +, -, @) et échappe les guillemets
  const cell = (v: string | number) => {
    const s = String(v);
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Nom", "Téléphone", "Accompagnants", "Inscrit le"],
    ...event.registrations.map((r) => [r.name, r.phone, r.guests, r.createdAt.toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo" })]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscrits-${event.slug}.csv"` },
  });
}
