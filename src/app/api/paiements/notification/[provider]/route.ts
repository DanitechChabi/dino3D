import { NextResponse } from "next/server";
import { getProvider, settleDonation } from "@/lib/payments";

// Notification serveur à serveur envoyée par le fournisseur de paiement.
export async function POST(request: Request, ctx: RouteContext<"/api/paiements/notification/[provider]">) {
  const { provider: id } = await ctx.params;
  const provider = getProvider(id);
  if (!provider) return NextResponse.json({ error: "Fournisseur inconnu" }, { status: 404 });

  const result = await provider.parseWebhook(request);
  if (!result) return NextResponse.json({ error: "Signature invalide" }, { status: 401 });

  // Double contrôle : on redemande l'état au fournisseur avant de valider
  const verified = id === "simulation" ? result.status : await provider.verify(result.reference, result.providerRef ?? null);
  await settleDonation(result.reference, verified, result.providerRef);
  return NextResponse.json({ ok: true });
}
