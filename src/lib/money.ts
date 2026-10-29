/** « 5 000 F CFA » */
export function formatXOF(amount: number) {
  return `${amount.toLocaleString("fr-FR").replace(/ | /g, " ")} F CFA`;
}

export const MIN_AMOUNT = 100;
export const MAX_AMOUNT = 10_000_000;
export const AMOUNT_PRESETS = [1000, 2000, 5000, 10000, 25000, 50000];

export const METHOD_LABELS = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  CASH: "Espèces",
  TRANSFER: "Virement",
} as const;

export const STATUS_LABELS = {
  PENDING: "En attente",
  SUCCEEDED: "Reçu",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
} as const;
