import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, HandHeart, Lock, Quote } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { getProvider } from "@/lib/payments";
import { beneficiaryLabel, canReview, caseTotals, isAcceptingGifts, VISIBILITY_LABELS } from "@/lib/solidarity";
import { formatXOF } from "@/lib/money";
import { formatDay } from "@/lib/time";
import { LightParticles } from "@/components/motion/LightParticles";
import { SplitWords } from "@/components/motion/SplitWords";
import { Reveal } from "@/components/motion/Reveal";
import { ProgressRing } from "@/components/solidarity/Progress";
import { SolidarityGiveForm } from "@/components/solidarity/SolidarityGiveForm";
import { ShareButtons } from "@/components/ShareButtons";

async function load(slug: string) {
  return db.solidarityCase.findUnique({ where: { slug }, include: { payouts: { orderBy: { paidAt: "asc" } } } });
}

export async function generateMetadata(props: PageProps<"/solidarite/[slug]">): Promise<Metadata> {
  const c = await load((await props.params).slug);
  if (!c || !["OPEN", "CLOSED"].includes(c.status) || c.visibility === "MEMBERS") return { title: "Solidarité", robots: { index: false } };
  return { title: c.title };
}

export default async function CasePage(props: PageProps<"/solidarite/[slug]">) {
  const [c, user] = await Promise.all([load((await props.params).slug), getCurrentUser()]);
  if (!c || !["OPEN", "CLOSED"].includes(c.status)) notFound();
  if (c.visibility === "MEMBERS" && !user) {
    return (
      <section className="flex min-h-[70svh] items-center justify-center px-4 pt-28 text-center">
        <div>
          <Lock className="mx-auto size-10 text-gold-500" />
          <h1 className="mt-4 font-serif text-4xl font-semibold text-night-900">Collecte réservée aux membres</h1>
          <p className="mt-2 text-night-800/70">Connectez-vous à votre espace membre pour la consulter.</p>
          <Link href={`/connexion?suite=/solidarite/${c.slug}`} className="mt-6 inline-block rounded-full bg-night-950 px-6 py-3 font-bold text-gold-200">Se connecter</Link>
        </div>
      </section>
    );
  }
  const staff = canReview(user?.role);
  const t = (await caseTotals([c.id])).get(c.id)!;
  const provider = getProvider();
  const accepting = isAcceptingGifts(c);

  return (
    <>
      <section className="relative overflow-hidden bg-night-950 pb-16 pt-36 text-white sm:pt-44">
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_70%_30%,#22326b_0%,#070d24_60%,#04081a_100%)]" />
        <LightParticles density={40} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              Solidarité · {c.reason}
              {c.visibility !== "PUBLIC" && <span className="rounded-full bg-white/10 px-2 py-0.5 normal-case tracking-normal text-white/70">{VISIBILITY_LABELS[c.visibility]}</span>}
            </p>
            <SplitWords as="h1" text={c.title} className="mt-3 font-serif text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.05]" />
            <p className="mt-3 text-white/70">Pour : {beneficiaryLabel(c, staff)}</p>
            {c.deadline && (
              <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
                <CalendarClock className="size-4 text-gold-300" /> {accepting ? `Jusqu'au ${formatDay(c.deadline).toLowerCase()}` : "Collecte terminée"}
              </p>
            )}
          </div>
          <Reveal>
            <ProgressRing raised={t.raised} goal={c.goal} donors={t.donors} />
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {c.status === "CLOSED" && c.thanksMessage && (
              <Reveal className="mb-10 rounded-3xl bg-night-950 p-7 text-white">
                <Quote className="size-8 text-gold-400" />
                <p className="mt-3 whitespace-pre-line font-serif text-2xl italic leading-relaxed">{c.thanksMessage}</p>
              </Reveal>
            )}
            {c.story.split(/\n{2,}/).map((p, i) => (
              <Reveal key={i}>
                <p className="mb-5 whitespace-pre-line text-lg leading-relaxed text-night-800">{p}</p>
              </Reveal>
            ))}
            <Reveal>
              <blockquote className="my-8 border-l-4 border-gold-400 pl-5 font-serif text-xl italic text-night-800">
                « Celui qui a pitié du pauvre prête à l&apos;Éternel, qui lui rendra selon son œuvre. » <span className="not-italic text-gold-600">— Proverbes 19:17</span>
              </blockquote>
            </Reveal>
            {c.payouts.length > 0 && (
              <Reveal className="rounded-3xl border border-night-900/10 bg-white p-6">
                <h2 className="mb-3 font-serif text-2xl font-semibold text-night-900">Aide remise</h2>
                <ul className="divide-y divide-night-900/5 text-sm">
                  {c.payouts.map((p) => (
                    <li key={p.id} className="flex justify-between gap-4 py-2.5">
                      <span>{p.paidAt.toLocaleDateString("fr-FR")}{p.note && <span className="text-night-800/60"> · {p.note}</span>}</span>
                      <span className="font-bold text-night-900">{formatXOF(p.amount)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-right text-sm font-bold text-night-900">Total versé : {formatXOF(t.paidOut)}</p>
              </Reveal>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {accepting ? (
              provider ? (
                <div className="rounded-3xl border border-gold-500/30 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(7,13,36,.5)]">
                  <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-semibold text-night-900"><HandHeart className="size-5 text-gold-600" /> Je soutiens</h2>
                  <SolidarityGiveForm caseId={c.id} methods={provider.methods} user={user ? { name: `${user.firstName} ${user.lastName}`, phone: user.phone } : null} />
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-gold-500/40 bg-white p-6 text-sm text-night-800/70">Le don en ligne arrive bientôt. Vous pouvez remettre votre soutien au trésorier de l&apos;église.</p>
              )
            ) : (
              <p className="rounded-3xl bg-parchment p-6 font-semibold text-night-900">Cette collecte est terminée. Merci à tous les donateurs !</p>
            )}
            {c.visibility !== "MEMBERS" && (
              <div className="rounded-3xl border border-night-900/10 bg-white p-6">
                <ShareButtons title={c.title} />
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
