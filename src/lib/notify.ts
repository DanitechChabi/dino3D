import "server-only";
import webpush from "web-push";
import { db } from "./db";

export type Audience = "services" | "events" | "news";
export type Notice = { title: string; body: string; url?: string; tag?: string };

let configured: boolean | null = null;

/** Les notifications push nécessitent les clés VAPID (voir README). */
export function pushConfigured() {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  configured = Boolean(pub && priv);
  if (configured) webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:ebbtanmey@gmail.com", pub!, priv!);
  return configured;
}

/**
 * Envoie une notification à tous les abonnés d'un type de contenu.
 * Les abonnements expirés (désinstallés, refusés) sont supprimés au passage.
 *
 * Pour ajouter les SMS ou WhatsApp plus tard : brancher ici l'API du fournisseur
 * choisi et l'appeler avec les numéros des membres concernés.
 */
export async function notify(audience: Audience, notice: Notice) {
  if (!pushConfigured()) return { sent: 0, failed: 0, skipped: true };
  const subs = await db.pushSubscription.findMany({ where: { [audience]: true } });
  const payload = JSON.stringify({ ...notice, url: notice.url ?? "/" });

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 6 * 3600 });
        sent++;
      } catch (err) {
        failed++;
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) expired.push(s.id);
      }
    }),
  );
  if (expired.length) await db.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  return { sent, failed, skipped: false };
}
