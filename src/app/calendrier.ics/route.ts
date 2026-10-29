import { db } from "@/lib/db";
import { buildIcs } from "@/lib/ics";
import { churchDateTime, serviceOccurrences } from "@/lib/time";
import { church } from "@/content/site";

// Flux d'agenda auquel les téléphones s'abonnent : cultes hebdomadaires + événements, avec rappels intégrés.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  const [services, events] = await Promise.all([
    db.service.findMany(),
    db.event.findMany({ where: { published: true, startAt: { gte: since } }, orderBy: { startAt: "asc" } }),
  ]);

  // Première occurrence de chaque culte depuis le 1er janvier 2026 (début de la récurrence)
  const firsts = serviceOccurrences(services, new Date("2026-01-01T00:00:00+01:00"), 62);
  const ics = buildIcs(`${church.shortName} — ${church.city}`, [
    ...services.map((s) => {
      const d = firsts.find((o) => o.service.id === s.id)!.day;
      return {
        uid: `service-${s.id}@ebb-jr`,
        title: s.name,
        description: s.description ?? undefined,
        location: `${s.location}, ${church.name}, ${church.city}`,
        start: churchDateTime(d, s.startTime),
        end: s.endTime ? churchDateTime(d, s.endTime) : null,
        weeklyOn: s.dayOfWeek,
        monthWeeks: s.weeks,
        alarms: s.reminders ? [60] : [],
        url: `${origin}/cultes`,
      };
    }),
    ...events.map((e) => ({
      uid: `event-${e.id}@ebb-jr`,
      title: e.title,
      description: e.summary,
      location: e.location,
      start: e.startAt,
      end: e.endAt,
      alarms: [24 * 60, 60],
      url: `${origin}/evenements/${e.slug}`,
    })),
  ]);

  return new Response(ics, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=1800" },
  });
}
