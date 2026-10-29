import type { Metadata } from "next";
import Link from "next/link";
import { Users, UserPlus, Mail, HeartHandshake, HandHelping } from "lucide-react";
import { db } from "@/lib/db";
import { hasRole, requireRole } from "@/lib/dal";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminHome() {
  const user = await requireRole("RESPONSABLE");
  const isAdmin = user.role === "ADMIN";
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const visibleMessages = isAdmin ? {} : { isPrayer: false };

  const [members, newMembers, unread, prayers, latestMembers, latestMessages] = await Promise.all([
    db.user.count({ where: { active: true } }),
    db.user.count({ where: { createdAt: { gte: monthStart } } }),
    db.contactMessage.count({ where: { handled: false, ...visibleMessages } }),
    isAdmin ? db.contactMessage.count({ where: { handled: false, isPrayer: true } }) : Promise.resolve(0),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, firstName: true, lastName: true, createdAt: true } }),
    db.contactMessage.findMany({ where: visibleMessages, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const pendingHelp = hasRole(user.role, "TRESORIER") ? await db.solidarityCase.count({ where: { status: "PROPOSED" } }) : 0;
  const stats = [
    { label: "Membres actifs", value: members, icon: Users },
    { label: "Nouveaux ce mois", value: newMembers, icon: UserPlus },
    { label: "Messages non traités", value: unread, icon: Mail },
    ...(isAdmin ? [{ label: "Prières en attente", value: prayers, icon: HeartHandshake }] : []),
    ...(hasRole(user.role, "TRESORIER") ? [{ label: "Demandes d'aide à examiner", value: pendingHelp, icon: HandHelping }] : []),
  ];

  return (
    <>
      <AdminTitle title={`Bonjour, ${user.firstName}`} text="Vue d'ensemble de la vie de l'église." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <Reveal key={label} delay={i * 0.06}>
            <div className="relative overflow-hidden rounded-3xl bg-night-950 p-6 text-white">
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold-400/20 blur-2xl" />
              <Icon className="size-5 text-gold-300" />
              <p className="mt-4 font-serif text-5xl font-semibold"><AnimatedNumber value={value} /></p>
              <p className="mt-1 text-sm text-white/65">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Derniers inscrits</h2>
          <ul className="divide-y divide-night-900/5">
            {latestMembers.map((m) => (
              <li key={m.id} className="flex justify-between py-3 text-sm">
                <span className="font-semibold text-night-900">{m.firstName} {m.lastName}</span>
                <span className="text-night-800/60">{m.createdAt.toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
          {isAdmin && <Link href="/admin/membres" className="mt-3 inline-block text-sm font-bold text-gold-600">Gérer les membres →</Link>}
        </Panel>
        <Panel>
          <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Derniers messages</h2>
          {latestMessages.length === 0 && <p className="text-sm text-night-800/60">Aucun message.</p>}
          <ul className="divide-y divide-night-900/5">
            {latestMessages.map((m) => (
              <li key={m.id} className="py-3 text-sm">
                <p className="flex items-center gap-2 font-semibold text-night-900">
                  {!m.handled && <span className="size-2 rounded-full bg-gold-500" />}
                  {m.subject} {m.isPrayer && <span className="rounded-full bg-gold-300/40 px-2 text-xs text-gold-600">Prière</span>}
                </p>
                <p className="text-night-800/60">{m.name} · {m.createdAt.toLocaleDateString("fr-FR")}</p>
              </li>
            ))}
          </ul>
          <Link href="/admin/messages" className="mt-3 inline-block text-sm font-bold text-gold-600">Tous les messages →</Link>
        </Panel>
      </div>
    </>
  );
}
