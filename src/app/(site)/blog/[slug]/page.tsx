import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { activities, sortedActivities, getActivity, formatActivityDate, wallPhotos } from "@/content/activities";
import { CinematicHero } from "@/components/motion/CinematicHero";
import { ReadingProgress } from "@/components/motion/ReadingProgress";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { PolaroidWall } from "@/components/gallery/PolaroidWall";
import { ShareButtons } from "@/components/ShareButtons";
import { WhatsappChannelButton } from "@/components/WhatsappChannelButton";

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const a = getActivity((await props.params).slug);
  if (!a) return {};
  const cover = a.photos[a.cover];
  return { title: a.title, description: a.excerpt, openGraph: { title: a.title, description: a.excerpt, images: [cover.src] } };
}

export default async function ArticlePage(props: PageProps<"/blog/[slug]">) {
  const article = getActivity((await props.params).slug);
  if (!article) notFound();
  const cover = article.photos[article.cover];
  const idx = sortedActivities.findIndex((a) => a.slug === article.slug);
  const newer = sortedActivities[idx - 1];
  const older = sortedActivities[idx + 1];

  const meta = [
    article.date && { icon: CalendarDays, text: formatActivityDate(article.date) },
    article.time && { icon: Clock, text: article.time },
    article.place && { icon: MapPin, text: article.place },
  ].filter(Boolean) as { icon: typeof Clock; text: string }[];

  return (
    <>
      <ReadingProgress />
      <CinematicHero src={cover.src} alt={cover.caption}>
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-40">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">{article.category}</p>
          <SplitWords as="h1" text={article.title} className="mt-3 font-serif text-[clamp(2.2rem,6vw,4.25rem)] font-semibold leading-[1.05] text-white" />
          {meta.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {meta.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5"><Icon className="size-4 text-gold-300" />{text}</span>
              ))}
            </div>
          )}
        </div>
      </CinematicHero>

      <article className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          {article.body.map((p, i) => (
            <Reveal key={i} delay={0.05}>
              <p
                className={`mb-6 text-lg leading-[1.85] text-night-800 sm:text-xl ${
                  i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-gold-600" : ""
                }`}
              >
                {p}
              </p>
            </Reveal>
          ))}

          {article.verse && (
            <Reveal>
              <figure className="relative my-12 overflow-hidden rounded-3xl bg-night-950 px-8 py-10 text-center">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(212,164,60,.3),transparent)]" />
                <span className="relative block font-serif text-7xl leading-none text-gold-400/50">“</span>
                <blockquote className="relative -mt-4 font-serif text-2xl italic leading-snug text-white sm:text-3xl">{article.verse.text}</blockquote>
                <figcaption className="relative mt-4 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">{article.verse.ref}</figcaption>
              </figure>
            </Reveal>
          )}

          <Reveal className="border-y border-night-900/10 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <ShareButtons title={article.title} />
              <WhatsappChannelButton className="text-sm" />
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 max-w-6xl px-4">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-night-900">En images</h2>
          {wallPhotos(article).length > 0 && (
            <div className="mb-12">
              <PolaroidWall photos={wallPhotos(article)} />
            </div>
          )}
          <PhotoGrid photos={article.photos} />
        </div>

        <nav className="mx-auto mt-16 grid max-w-6xl gap-4 px-4 sm:grid-cols-2" aria-label="Autres articles">
          {older ? (
            <Link href={`/blog/${older.slug}`} className="group rounded-3xl border border-night-900/10 bg-white p-6 hover:border-gold-400">
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-600"><ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" /> Article précédent</p>
              <p className="mt-2 font-serif text-xl font-semibold text-night-900">{older.title}</p>
            </Link>
          ) : <span />}
          {newer && (
            <Link href={`/blog/${newer.slug}`} className="group rounded-3xl border border-night-900/10 bg-white p-6 text-right hover:border-gold-400">
              <p className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Article suivant <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></p>
              <p className="mt-2 font-serif text-xl font-semibold text-night-900">{newer.title}</p>
            </Link>
          )}
        </nav>
      </article>
    </>
  );
}
