import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});
const prefsSchema = z.object({ services: z.boolean(), events: z.boolean(), news: z.boolean() }).partial();

/** Enregistre (ou met à jour) l'abonnement aux notifications de cet appareil. */
export async function POST(request: NextRequest) {
  const body = z.object({ subscription: subscriptionSchema, prefs: prefsSchema.optional() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Abonnement invalide" }, { status: 400 });
  const { subscription, prefs } = body.data;
  const session = await readSession();
  const data = { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, ...prefs, ...(session ? { userId: session.userId } : {}) };
  const row = await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: data,
    create: { endpoint: subscription.endpoint, ...data },
    select: { services: true, events: true, news: true },
  });
  return NextResponse.json({ ok: true, prefs: row });
}

/** Modifie les préférences (cultes, événements, annonces) d'un appareil abonné. */
export async function PATCH(request: NextRequest) {
  const body = z.object({ endpoint: z.url(), prefs: prefsSchema }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  const row = await db.pushSubscription.updateMany({ where: { endpoint: body.data.endpoint }, data: body.data.prefs });
  return NextResponse.json({ ok: row.count > 0 });
}

/** Désabonne cet appareil. */
export async function DELETE(request: NextRequest) {
  const body = z.object({ endpoint: z.url() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  await db.pushSubscription.deleteMany({ where: { endpoint: body.data.endpoint } });
  return NextResponse.json({ ok: true });
}
