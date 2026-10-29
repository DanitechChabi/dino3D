import { db } from "@/lib/db";
import { buildIcs } from "@/lib/ics";

// Fichier .ics d'un événement : « Ajouter à mon agenda » (iPhone, Outlook, Android).
export async function GET(request: Request, ctx: RouteContext<"/evenements/[slug]/agenda.ics">) {
  const { slug } = await ctx.params;
  const e = await db.event.findFirst({ where: { slug, published: true } });
  if (!e) return new Response("Introuvable", { status: 404 });
  const origin = new URL(request.url).origin;
  const ics = buildIcs(e.title, [
    { uid: `event-${e.id}@ebb-jr`, title: e.title, description: e.summary, location: e.location, start: e.startAt, end: e.endAt, alarms: [24 * 60, 60], url: `${origin}/evenements/${e.slug}` },
  ]);
  return new Response(ics, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${e.slug}.ics"` },
  });
}
