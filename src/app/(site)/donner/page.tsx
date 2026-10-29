import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HandHeart, Landmark, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { getProvider } from "@/lib/payments";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { GivingForm } from "@/components/giving/GivingForm";
import { church } from "@/content/site";

export const metadata: Metadata = { title: "Faire un don", description: "Dîmes, offrandes et dons en ligne par Mobile Money ou carte bancaire." };

export default async function GivePage(props: PageProps<"/donner">) {
  const { type } = await props.searchParams;
  const [categories, user] = await Promise.all([
    db.givingCategory.findMany({ where: { active: true, slug: { not: "solidarite" } }, orderBy: { order: "asc" }, select: { id: true, slug: true, name: true, description: true, confidential: true } }),
    getCurrentUser(),
  ]);
  const provider = getProvider();
  const initial = categories.find((c) => c.slug === type)?.id;

  return (
    <>
      <PageHeader eyebrow="Faire un don" title="Donner avec joie" subtitle="« Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie. » — 2 Corinthiens 9:7" />
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            {provider ? (
              <GivingForm
                categories={categories}
                initialCategory={initial}
                user={user ? { name: `${user.firstName} ${user.lastName}`, phone: user.phone } : null}
                methods={provider.methods}
                testMode={provider.id === "simulation"}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-gold-500/40 bg-white p-8 text-center">
                <HandHeart className="mx-auto size-10 text-gold-500" />
                <h2 className="mt-4 font-serif text-3xl font-semibold text-night-900">Le don en ligne arrive bientôt</h2>
                <p className="mt-3 text-night-800/70">
                  En attendant, vous pouvez donner au temple pendant le culte, ou contacter l&apos;église au {church.phone}.
                </p>
              </div>
            )}
          </Reveal>
          <aside className="space-y-5">
            {[
              { icon: ShieldCheck, title: "Sécurisé", text: "Le paiement est traité par un prestataire agréé. L'église ne voit jamais votre code Mobile Money ni votre carte." },
              { icon: Landmark, title: "Transparent", text: "Chaque don est enregistré et suivi par le trésorier. Vous recevez un reçu, et retrouvez vos dons dans votre espace membre." },
              { icon: HandHeart, title: "Confidentiel", text: "Vos dîmes restent strictement confidentielles : seuls vous et le trésorier y avez accès." },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={0.1 + i * 0.08}>
                <div className="flex gap-4 rounded-3xl border border-night-900/10 bg-white p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-night-950 text-gold-300"><Icon className="size-5" /></span>
                  <div>
                    <p className="font-bold text-night-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-night-800/70">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <Link href="/solidarite" className="group flex items-center justify-between gap-3 rounded-3xl border border-gold-500/40 bg-gold-300/20 p-5">
                <span>
                  <span className="block font-bold text-night-900">Soutenir un frère ou une sœur</span>
                  <span className="text-sm text-night-800/70">Voir les collectes de solidarité en cours</span>
                </span>
                <ArrowRight className="size-5 text-gold-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <Reveal delay={0.4}>
              <blockquote className="rounded-3xl bg-night-950 p-6 font-serif text-xl italic leading-snug text-white">
                « Honore l&apos;Éternel avec tes biens, et avec les prémices de tout ton revenu. »
                <span className="mt-2 block font-sans text-xs font-bold not-italic uppercase tracking-[0.25em] text-gold-300">Proverbes 3:9</span>
              </blockquote>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
