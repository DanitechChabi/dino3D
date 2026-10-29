import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryGrid } from "@/components/motion/GalleryGrid";
import { gallery } from "@/content/site";

export const metadata: Metadata = { title: "Galerie" };

export default function GalleryPage() {
  return (
    <>
      <PageHeader eyebrow="Galerie" title="Moments de grâce" subtitle="Quelques images de la vie de notre église." />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <GalleryGrid items={gallery} />
        </div>
      </section>
    </>
  );
}
