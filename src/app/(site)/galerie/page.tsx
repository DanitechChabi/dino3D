import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { AlbumCard } from "@/components/gallery/AlbumCard";
import { sortedActivities } from "@/content/activities";

export const metadata: Metadata = { title: "Galerie" };

export default function GalleryPage() {
  const total = sortedActivities.reduce((n, a) => n + a.photos.length, 0);
  return (
    <>
      <PageHeader eyebrow="Galerie" title="Moments de grâce" subtitle={`${sortedActivities.length} albums · ${total} photos de la vie de notre église.`} />
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-14 px-8 sm:grid-cols-2 sm:px-12 lg:grid-cols-3">
          {sortedActivities.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 0.1}>
              <AlbumCard activity={a} href={`/galerie/${a.slug}`} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
