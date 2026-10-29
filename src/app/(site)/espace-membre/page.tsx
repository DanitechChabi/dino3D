import type { Metadata } from "next";
import Link from "next/link";
import { HandCoins, LogOut, Pin, Settings, Shield } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, hasRole, ROLE_LABELS } from "@/lib/dal";
import { logout } from "@/actions/auth";
import { cancelRegistration } from "@/actions/events";
import { NotifyButton } from "@/components/NotifyButton";
import { DateBlock } from "@/components/events/DateBlock";
import { DAYS } from "@/content/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { MinistryToggles, PasswordForm, ProfileForm } from "@/components/forms/MemberForms";

export const metadata: Metadata = { title: "Mon espace" };

function Card({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`rounded-3xl border p-6 sm:p-7 ${dark ? "border-transparent bg-night-950 text-white" : "border-night-900/10 bg-white"}`}>
      <h2 className={`mb-5 font-serif text-2xl font-semibold ${dark ? "text-white" : "text-night-900"}`}>{title}</h2>
      {children}
    </div>
  );
}

export default async function MemberPage() {
  const me = await requireUser();
  const [user, ministries, services, announcements, registrations] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: me.id }, include: { ministries: true } }),
    db.ministry.findMany({ orderBy: { order: "asc" } }),
    db.service.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
    db.announcement.findMany({ where: { published: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 4 }),
    db.eventRegistration.findMany({
      where: { userId: me.id, event: { startAt: { gte: new Date() } } },
      include: { event: { select: { title: true, slug: true, startAt: true } } },
      orderBy: { event: { startAt: "asc" } },
    }),
  ]);
  const joined = new Set(user.ministries.map((m) => m.ministryId));

  return (
    <>
      <PageHeader eyebrow={ROLE_LABELS[user.role]} title={`Shalom, ${user.firstName} !`} subtitle="« Que la grâce et la paix vous soient multipliées. » — 1 Pierre 1:2" />
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-8 flex flex-wrap gap-3">
            {hasRole(user.role, "RESPONSABLE") && (
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-night-950 px-5 py-2.5 text-sm font-bold text-gold-200">
                <Shield className="size-4" /> Administration
              </Link>
            )}
            <form action={logout}>
              <button className="inline-flex items-center gap-2 rounded-full border border-night-900/15 bg-white px-5 py-2.5 text-sm font-bold text-night-900 hover:border-red-300 hover:text-red-700">
                <LogOut className="size-4" /> Se déconnecter
              </button>
            </form>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Reveal>
                <Card title="Mon profil">
                  <p className="mb-4 flex items-center gap-2 text-sm text-night-800/60">
                    <Settings className="size-4" /> Téléphone de connexion : <span className="font-semibold text-night-900">{user.phone}</span>
                  </p>
                  <ProfileForm
                    profile={{
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
                    }}
                  />
                </Card>
              </Reveal>
              <Reveal>
                <Card title="Mes ministères">
                  <p className="mb-4 text-sm text-night-800/70">Indiquez les ministères dans lesquels vous servez ou souhaitez servir.</p>
                  <MinistryToggles ministries={ministries.map((m) => ({ id: m.id, name: m.name, icon: m.icon, joined: joined.has(m.id) }))} />
                </Card>
              </Reveal>
              <Reveal>
                <Card title="Sécurité">
                  <PasswordForm />
                </Card>
              </Reveal>
            </div>

            <div className="space-y-6">
              <Reveal>
                <Card title="Cette semaine" dark>
                  <ul className="space-y-3">
                    {services.map((s) => (
                      <li key={s.id} className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3 last:border-0">
                        <span className="text-sm">
                          <span className="block font-semibold text-white">{s.name}</span>
                          <span className="text-white/60">{DAYS[s.dayOfWeek]}</span>
                        </span>
                        <span className="font-serif text-xl text-gold-300">{s.startTime.replace(":", "h")}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
              <Reveal>
                <Card title="Annonces">
                  <ul className="space-y-4">
                    {announcements.map((a) => (
                      <li key={a.id}>
                        <p className="flex items-center gap-1.5 font-semibold text-night-900">
                          {a.pinned && <Pin className="size-3.5 text-gold-600" />}
                          {a.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-night-800/70">{a.body}</p>
                      </li>
                    ))}
                  </ul>
                  <Link href="/annonces" className="mt-4 inline-block text-sm font-bold text-gold-600">Toutes les annonces →</Link>
                </Card>
              </Reveal>
              <Reveal>
                <Card title="Mes rappels">
                  <p className="mb-4 text-sm text-night-800/70">La veille et 1 h avant chaque culte et événement, sur ce téléphone.</p>
                  <NotifyButton />
                </Card>
              </Reveal>
              <Reveal>
                <Card title="Mes inscriptions">
                  {registrations.length === 0 ? (
                    <p className="text-sm text-night-800/60">
                      Aucune inscription à venir. <Link href="/evenements" className="font-bold text-gold-600">Voir l&apos;agenda</Link>
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {registrations.map((r) => (
                        <li key={r.id} className="flex items-center gap-3">
                          <DateBlock date={r.event.startAt} />
                          <div className="min-w-0 flex-1">
                            <Link href={`/evenements/${r.event.slug}`} className="font-semibold text-night-900 hover:text-gold-600">{r.event.title}</Link>
                            {r.guests > 0 && <p className="text-xs text-night-800/60">+ {r.guests} accompagnant{r.guests > 1 ? "s" : ""}</p>}
                            <form action={cancelRegistration.bind(null, r.id)}>
                              <button className="text-xs text-red-700 hover:underline">Annuler</button>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Reveal>
              <Reveal>
                <div className="rounded-3xl border border-dashed border-gold-500/40 bg-parchment p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Bientôt disponible</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-night-800"><HandCoins className="size-4 text-gold-600" /> Dîmes, offrandes et historique de mes dons</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
