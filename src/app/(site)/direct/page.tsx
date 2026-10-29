import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, HandHeart, Radio } from "lucide-react";
import { db } from "@/lib/db";
import { currentLive, nextLive } from "@/lib/lives";
import { formatDay, formatTime } from "@/lib/time";
import { getSettings } from "@/lib/settings";
import { LightParticles } from "@/components/motion/LightParticles";
import { Reveal } from "@/components/motion/Reveal";
import { VideoPlayer } from "@/components/live/VideoPlayer";
import { SermonCard } from "@/components/live/SermonCard";
import { EventCountdown } from "@/components/events/EventCountdown";
import { NotifyButton } from "@/components/NotifyButton";
import { ShareButtons } from "@/components/ShareButtons";
import { YoutubeIcon } from "@/components/YoutubeIcon";

export const metadata: Metadata = { title: "En direct", description: "Suivez les cultes de l'EBB-JR de Tanmey en direct." };

export default async function LivePage() {
  const { youtube } = await getSettings();
  const [live, next, recent] = await Promise.all([
    currentLive(),
    nextLive(),
    db.livestream.findMany({ where: { status: "ENDED", published: true, url: { not: null } }, orderBy: { scheduledAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-night-950 pb-16 pt-32 text-white sm:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,#22326b_0%,#070d24_60%,#04081a_100%)]" />
        <LightParticles density={40} />
        <div className="relative mx-auto max-w-5xl px-4">
          {live && live.url ? (
            <>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <span className="size-2 animate-pulse rounded-full bg-white" /> En direct
              </p>
              <h1 className="mb-6 font-serif text-4xl font-semibold sm:text-5xl">{live.title}</h1>
              <VideoPlayer platform={live.platform} url={live.url} videoId={live.videoId} title={live.title} live />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-white/70">
                  {live.preacher && <>Prédicateur : <strong className="text-white">{live.preacher}</strong></>}
                  {live.scripture && <> · {live.scripture}</>}
                </p>
                <Link href="/donner?type=quete" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 px-6 py-3 font-bold text-night-950">
                  <HandHeart className="size-4" /> Donner pendant le culte
                </Link>
              </div>
            </>
          ) : next ? (
            <div className="text-center">
              <Radio className="mx-auto size-10 text-gold-300" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Prochain direct</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-6xl">{next.title}</h1>
              <p className="mt-3 flex items-center justify-center gap-2 text-white/70"><CalendarDays className="size-4 text-gold-300" /> {formatDay(next.scheduledAt)} à {formatTime(next.scheduledAt)}</p>
              <div className="mt-8 flex justify-center"><EventCountdown start={next.scheduledAt.toISOString()} /></div>
              <div className="mx-auto mt-10 max-w-md"><NotifyButton dark /></div>
            </div>
          ) : (
            <div className="text-center">
              <Radio className="mx-auto size-10 text-gold-300" />
              <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Aucun direct pour le moment</h1>
              <p className="mx-auto mt-3 max-w-md text-white/70">Nos cultes sont diffusés en direct dès que possible. Activez les rappels pour être prévenu au lancement.</p>
              <div className="mx-auto mt-8 max-w-md"><NotifyButton dark /></div>
            </div>
          )}
          {youtube && (
            <p className="mt-8 text-center">
              <a href={youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
                <YoutubeIcon className="size-5 text-[#FF0000]" /> Notre chaîne YouTube
              </a>
            </p>
          )}
        </div>
      </section>

      {live && (
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4">
            <ShareButtons title={`En direct : ${live.title}`} />
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-4xl font-semibold text-night-900">Dernières prédications</h2>
              <Link href="/predications" className="inline-flex items-center gap-1 text-sm font-bold text-gold-600">Toutes les prédications <ArrowRight className="size-4" /></Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recent.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08}>
                  <SermonCard sermon={s} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
