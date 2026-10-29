import "server-only";
import { cache } from "react";
import { db } from "./db";

/** Direct en cours (le plus récent), pour la pastille « EN DIRECT » affichée sur tout le site. */
export const currentLive = cache(async () =>
  db.livestream.findFirst({ where: { status: "LIVE", published: true }, orderBy: { startedAt: "desc" } }),
);

/** Prochain direct programmé. */
export async function nextLive() {
  return db.livestream.findFirst({
    where: { status: "SCHEDULED", published: true, scheduledAt: { gte: new Date(Date.now() - 2 * 3600_000) } },
    orderBy: { scheduledAt: "asc" },
  });
}
