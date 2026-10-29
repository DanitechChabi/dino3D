import "server-only";
import { db } from "./db";
import { getActivities } from "./content";
import { EVENT_CATEGORIES } from "./events";

/** Données des listes déroulantes du formulaire d'événement. */
export async function eventFormOptions() {
  const [ministries, activities] = await Promise.all([db.ministry.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }), getActivities()]);
  return {
    categories: EVENT_CATEGORIES,
    ministries,
    articles: activities.map((a) => ({ slug: a.slug, title: a.title })),
    photos: activities.flatMap((a) => a.photos.map((p) => p.src)),
  };
}
