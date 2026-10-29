import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { notify, type Audience } from "./notify";
import { churchParts, formatTime, serviceOccurrences } from "./time";

const HOUR = 3600_000;

/** Réserve une clé de rappel ; renvoie false si ce rappel a déjà été envoyé. */
async function claim(key: string) {
  try {
    await db.reminderLog.create({ data: { key } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false;
    throw e;
  }
}

function when(startAt: Date, now: Date) {
  const sameDay = churchParts(startAt).day === churchParts(now).day;
  return `${sameDay ? "Aujourd'hui" : "Demain"} à ${formatTime(startAt)}`;
}

type Item = { key: string; audience: Audience; title: string; startAt: Date; location: string; url: string };

/**
 * Envoie les rappels dus : la veille (dans les 24 h) et 1 h avant.
 * À appeler régulièrement (toutes les 15 minutes) par une tâche planifiée.
 */
export async function runReminders(now = new Date()) {
  const horizon = new Date(now.getTime() + 24 * HOUR);
  const [events, services] = await Promise.all([
    db.event.findMany({ where: { published: true, startAt: { gt: now, lte: horizon } } }),
    db.service.findMany(),
  ]);

  const items: Item[] = [
    ...events.map((e) => ({ key: `event:${e.id}`, audience: "events" as const, title: e.title, startAt: e.startAt, location: e.location, url: `/evenements/${e.slug}` })),
    ...serviceOccurrences(services, now, 1)
      .filter((o) => o.startAt <= horizon)
      .map((o) => ({ key: `service:${o.service.id}:${o.day}`, audience: "services" as const, title: o.service.name, startAt: o.startAt, location: o.service.location, url: "/cultes" })),
  ];

  const log: string[] = [];
  for (const item of items) {
    const left = item.startAt.getTime() - now.getTime();
    if (left <= HOUR) {
      // Le rappel « 1 h » remplace celui de la veille s'il n'a pas encore été envoyé
      await claim(`${item.key}:24h`);
      if (await claim(`${item.key}:1h`)) {
        const r = await notify(item.audience, { title: `Dans moins d'une heure : ${item.title}`, body: `${formatTime(item.startAt)} · ${item.location}`, url: item.url, tag: item.key });
        log.push(`${item.key}:1h → ${r.sent}`);
      }
    } else if (await claim(`${item.key}:24h`)) {
      const r = await notify(item.audience, { title: `Rappel : ${item.title}`, body: `${when(item.startAt, now)} · ${item.location}`, url: item.url, tag: item.key });
      log.push(`${item.key}:24h → ${r.sent}`);
    }
  }

  // Nettoyage des anciennes traces (plus de 30 jours)
  await db.reminderLog.deleteMany({ where: { sentAt: { lt: new Date(now.getTime() - 30 * 24 * HOUR) } } });
  return log;
}
