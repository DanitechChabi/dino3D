import "server-only";
import { randomBytes } from "node:crypto";
import type { DonationStatus } from "@prisma/client";
import { db } from "../db";
import { simulation } from "./simulation";
import { saaspay } from "./saaspay";
import type { PaymentProvider } from "./types";

const PROVIDERS: Record<string, PaymentProvider> = { simulation, saaspay };

/** Fournisseur actif (PAYMENT_PROVIDER), ou null si le paiement en ligne n'est pas activé. */
export function getProvider(id = process.env.PAYMENT_PROVIDER): PaymentProvider | null {
  // Sécurité : le mode test est refusé en production, sauf autorisation explicite
  if (id === "simulation" && process.env.NODE_ENV === "production" && process.env.ALLOW_PAYMENT_SIMULATION !== "true") return null;
  return (id && PROVIDERS[id]) || null;
}

/** Référence publique non devinable, ex. EBB-7K2M9QX4TD */
export function newReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(10);
  return "EBB-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Enregistre l'issue d'un paiement. Idempotent : seul un don « en attente » peut changer d'état,
 * ce qui protège contre les notifications répétées ou rejouées.
 */
export async function settleDonation(reference: string, status: DonationStatus, providerRef?: string) {
  if (status === "PENDING") return false;
  const res = await db.donation.updateMany({
    where: { reference, status: "PENDING" },
    data: { status, ...(status === "SUCCEEDED" ? { paidAt: new Date() } : {}), ...(providerRef ? { providerRef } : {}) },
  });
  if (res.count) {
    await db.financeLog.create({ data: { action: `paiement_${status.toLowerCase()}`, details: `Don ${reference}` } });
  }
  return res.count > 0;
}

/** Vérifie auprès du fournisseur l'état d'un don encore en attente. */
export async function refreshDonation(reference: string) {
  const d = await db.donation.findUnique({ where: { reference } });
  if (!d) return null;
  if (d.status !== "PENDING" || !d.provider) return d.status;
  const provider = getProvider(d.provider);
  if (!provider) return d.status;
  const status = await provider.verify(reference, d.providerRef);
  if (status !== "PENDING") await settleDonation(reference, status);
  return status;
}
