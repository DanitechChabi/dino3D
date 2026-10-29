import "server-only";
import { db } from "./db";
import { activities } from "@/content/activities";
import { EVENT_CATEGORIES } from "./events";

/** Données des listes déroulantes du formulaire d'événement. */
export async function eventFormOptions() {
  const ministries = await db.ministry.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });
  return {
    categories: EVENT_CATEGORIES,
    ministries,
    articles: activities.map((a) => ({ slug: a.slug, title: a.title })),
    photos: activities.flatMap((a) => a.photos.map((p) => p.src)),
  };
}
