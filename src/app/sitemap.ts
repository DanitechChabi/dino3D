import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { activities } from "@/content/activities";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Plan du site pour les moteurs de recherche (pages publiques uniquement)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ministries, events, sermons, cases, posts] = await Promise.all([
    db.ministry.findMany({ select: { slug: true } }),
    db.event.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.livestream.findMany({ where: { published: true, status: "ENDED", url: { not: null } }, select: { slug: true, updatedAt: true } }),
    db.solidarityCase.findMany({ where: { status: { in: ["OPEN", "CLOSED"] }, visibility: { not: "MEMBERS" } }, select: { slug: true } }),
    db.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const page = (path: string, priority = 0.6, lastModified?: Date) => ({ url: `${BASE}${path}`, priority, ...(lastModified ? { lastModified } : {}) });

  return [
    page("/", 1),
    ...["/a-propos", "/cultes", "/evenements", "/predications", "/direct", "/blog", "/galerie", "/ministeres", "/annonces", "/solidarite", "/donner", "/contact"].map((p) => page(p, 0.8)),
    ...ministries.map((m) => page(`/ministeres/${m.slug}`)),
    ...events.map((e) => page(`/evenements/${e.slug}`, 0.6, e.updatedAt)),
    ...sermons.map((s) => page(`/predications/${s.slug}`, 0.6, s.updatedAt)),
    ...cases.map((c) => page(`/solidarite/${c.slug}`, 0.4)),
    ...activities.flatMap((a) => [page(`/blog/${a.slug}`), page(`/galerie/${a.slug}`, 0.5)]),
    ...posts.flatMap((p) => [page(`/blog/${p.slug}`, 0.6, p.updatedAt), page(`/galerie/${p.slug}`, 0.5, p.updatedAt)]),
  ];
}
