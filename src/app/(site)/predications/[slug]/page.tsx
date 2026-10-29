import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Mic } from "lucide-react";
import { db } from "@/lib/db";
import { formatDay } from "@/lib/time";
import { thumbnailUrl } from "@/lib/video";
import { Reveal } from "@/components/motion/Reveal";
import { VideoPlayer } from "@/components/live/VideoPlayer";
import { SermonCard } from "@/components/live/SermonCard";
import { ShareButtons } from "@/components/ShareButtons";

async function load(slug: string) {
  return db.livestream.findFirst({ where: { slug, published: true, status: "ENDED", url: { not: null } } });
}

export async function generateMetadata(props: PageProps<"/predications/[slug]">): Promise<Metadata> {
  const s = await load((await props.params).slug);
  if (!s) return {};
  const thumb = thumbnailUrl(s.videoId);
  return { title: s.title, description: s.description.slice(0, 160) || undefined, openGraph: thumb ? { images: [thumb] } : undefined };
}

export default async function SermonPage(props: PageProps<"/predications/[slug]">) {
  const s = await load((await props.params).slug);
  if (!s || !s.url) notFound();
  const related = s.series
    ? await db.livestream.findMany({ where: { series: s.series, status: "ENDED", published: true, url: { not: null }, NOT: { id: s.id } }, orderBy: { scheduledAt: "desc" }, take: 3 })
    : [];

  return (
    <>
      <section className="bg-night-950 pb-14 pt-28 text-white sm:pt-36">
        <div className="mx-auto max-w-5xl px-4">
          <Link href="/predications" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-gold-300"><ArrowLeft className="size-4" /> Toutes les prédications</Link>
          <VideoPlayer platform={s.platform} url={s.url} videoId={s.videoId} title={s.title} />
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          {s.series && <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-600">Série · {s.series}</p>}
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-night-900 sm:text-5xl">{s.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-night-800/70">
            {s.preacher && <span className="flex items-center gap-1.5"><Mic className="size-4 text-gold-600" /> {s.preacher}</span>}
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-gold-600" /> {formatDay(s.scheduledAt)}</span>
            {s.scripture && <span className="flex items-center gap-1.5"><BookOpen className="size-4 text-gold-600" /> {s.scripture}</span>}
          </div>
          {s.description && (
            <Reveal>
              <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-night-800">{s.description}</p>
            </Reveal>
          )}
          <div className="mt-8 border-t border-night-900/10 pt-6"><ShareButtons title={s.title} /></div>
        </div>
        {related.length > 0 && (
          <div className="mx-auto mt-16 max-w-6xl px-4">
            <h2 className="mb-6 font-serif text-3xl font-semibold text-night-900">Dans la même série</h2>
            <div className="grid gap-6 md:grid-cols-3">{related.map((r) => <SermonCard key={r.id} sermon={r} />)}</div>
          </div>
        )}
      </section>
    </>
  );
}
