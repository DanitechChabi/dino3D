import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatDay } from "@/lib/time";
import { thumbnailUrl } from "@/lib/video";

export function SermonCard({ sermon }: { sermon: { slug: string; title: string; preacher: string | null; series: string | null; scheduledAt: Date; videoId: string | null } }) {
  const thumb = thumbnailUrl(sermon.videoId);
  return (
    <Link href={`/predications/${sermon.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-night-950">
        {thumb ? (
          <Image src={thumb} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#22326b,#04081a_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 to-transparent" />
        <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-gold-400 text-night-950 transition-transform group-hover:scale-110">
          <BookOpen className="size-4" />
        </span>
      </div>
      {sermon.series && <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{sermon.series}</p>}
      <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-night-900 group-hover:text-gold-600">{sermon.title}</h3>
      <p className="mt-1 text-sm text-night-800/60">
        {sermon.preacher && `${sermon.preacher} · `}
        {formatDay(sermon.scheduledAt, true)}
      </p>
    </Link>
  );
}
