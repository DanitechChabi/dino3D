import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { activities, formatActivityDate, wallPhotos } from "@/content/activities";
import { findActivity } from "@/lib/content";
import { CinematicHero } from "@/components/motion/CinematicHero";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { PolaroidWall } from "@/components/gallery/PolaroidWall";

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/galerie/[slug]">): Promise<Metadata> {
  const a = await findActivity((await props.params).slug);
  return a ? { title: `${a.title} — photos`, description: a.excerpt } : {};
}

export default async function AlbumPage(props: PageProps<"/galerie/[slug]">) {
  const album = await findActivity((await props.params).slug);
  if (!album) notFound();
  const cover = album.photos[album.cover];

  return (
    <>
      <CinematicHero src={cover.src} alt={cover.caption}>
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-40">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">
            Album · {album.category} · {album.photos.length} photos
          </p>
          <SplitWords as="h1" text={album.title} className="mt-3 font-serif text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-[1.05] text-white" />
          {album.date && <p className="mt-3 text-white/75">{formatActivityDate(album.date)}</p>}
        </div>
      </CinematicHero>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-lg leading-relaxed text-night-800/80">{album.excerpt}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/blog/${album.slug}`} className="inline-flex items-center gap-2 rounded-full bg-night-950 px-5 py-2.5 text-sm font-bold text-gold-200">
                <BookOpen className="size-4" /> Lire l&apos;article
              </Link>
              <Link href="/galerie" className="inline-flex items-center gap-1 px-2 py-2.5 text-sm font-bold text-gold-600">
                <ArrowLeft className="size-4" /> Tous les albums
              </Link>
            </div>
          </Reveal>
          {wallPhotos(album).length > 0 && (
            <div className="mb-12">
              <PolaroidWall photos={wallPhotos(album)} />
            </div>
          )}
          <PhotoGrid photos={album.photos} />
        </div>
      </section>
    </>
  );
}
