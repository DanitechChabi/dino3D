import type { DonationStatus } from "@prisma/client";

export type PaymentRequest = {
  reference: string;
  amount: number; // XOF
  description: string;
  method: "MOBILE_MONEY" | "CARD";
  customer: { name: string; phone?: string | null };
  returnUrl: string; // page de retour après paiement
  webhookUrl: string; // notification serveur à serveur
};

export type PaymentStart =
  | { kind: "redirect"; url: string; providerRef?: string } // page de paiement du fournisseur
  | { kind: "pending"; message: string; providerRef?: string }; // validation sur le téléphone (USSD)

export type WebhookResult = { reference: string; status: DonationStatus; providerRef?: string };

/**
 * Contrat que doit respecter chaque fournisseur de paiement (simulation, SaaS Pay…).
 * Règle d'or : un paiement n'est validé qu'après vérification serveur auprès du fournisseur,
 * jamais sur la seule foi de la page de retour.
 */
export interface PaymentProvider {
  id: string;
  label: string;
  methods: ("MOBILE_MONEY" | "CARD")[];
  start(req: PaymentRequest): Promise<PaymentStart>;
  /** Interroge le fournisseur sur l'état réel du paiement. */
  verify(reference: string, providerRef: string | null): Promise<DonationStatus>;
  /** Lit et authentifie une notification du fournisseur ; null si la signature est invalide. */
  parseWebhook(request: Request): Promise<WebhookResult | null>;
}
