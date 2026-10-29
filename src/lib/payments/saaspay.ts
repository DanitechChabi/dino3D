import "server-only";
import type { PaymentProvider } from "./types";

/**
 * Intégration SaaS Pay — À COMPLÉTER avec la documentation de l'API.
 *
 * Variables d'environnement prévues :
 *   SAASPAY_API_URL, SAASPAY_API_KEY, SAASPAY_SECRET (vérification des notifications)
 *
 * À implémenter :
 *   - start()        : créer la transaction (montant, référence, téléphone, URL de retour et de notification)
 *                      et renvoyer l'URL de paiement ou un message « validez sur votre téléphone » ;
 *   - verify()       : interroger l'API pour connaître l'état réel de la transaction ;
 *   - parseWebhook() : vérifier la signature de la notification, puis renvoyer référence et état.
 */
export const saaspay: PaymentProvider = {
  id: "saaspay",
  label: "SaaS Pay",
  methods: ["MOBILE_MONEY", "CARD"],
  async start() {
    throw new Error("SaaS Pay n'est pas encore configuré (documentation de l'API attendue).");
  },
  async verify() {
    return "PENDING";
  },
  async parseWebhook() {
    return null;
  },
};
