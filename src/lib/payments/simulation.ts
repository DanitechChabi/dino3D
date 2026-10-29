import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "../db";
import type { PaymentProvider } from "./types";

// Fournisseur de démonstration : simule une page de paiement, sans aucun mouvement d'argent.
// Activé uniquement si PAYMENT_PROVIDER=simulation.

function secret() {
  const s = process.env.PAYMENT_WEBHOOK_SECRET || process.env.AUTH_SECRET;
  if (!s) throw new Error("PAYMENT_WEBHOOK_SECRET manquant");
  return s;
}

export function simulationSignature(body: string) {
  return createHmac("sha256", secret()).update(body).digest("hex");
}

export const simulation: PaymentProvider = {
  id: "simulation",
  label: "Mode test (aucun paiement réel)",
  methods: ["MOBILE_MONEY", "CARD"],

  async start(req) {
    return { kind: "redirect", url: `/donner/simulation/${req.reference}`, providerRef: `SIM-${req.reference}` };
  },

  async verify(reference) {
    // En simulation, l'état fait foi en base (mis à jour par la page de test signée)
    const d = await db.donation.findUnique({ where: { reference }, select: { status: true } });
    return d?.status ?? "FAILED";
  },

  async parseWebhook(request) {
    const body = await request.text();
    const given = request.headers.get("x-signature") ?? "";
    const expected = simulationSignature(body);
    if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
    const data = JSON.parse(body) as { reference: string; status: "SUCCEEDED" | "FAILED" | "CANCELLED" };
    return { reference: data.reference, status: data.status };
  },
};
