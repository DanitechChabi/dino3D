import type { Metadata } from "next";
import { AlertTriangle, BellRing, Smartphone } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { pushConfigured } from "@/lib/notify";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { BroadcastForm, RunRemindersButton } from "@/components/admin/BroadcastForm";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsAdmin() {
  await requireRole("ADMIN");
  const [total, services, events, news, members] = await Promise.all([
    db.pushSubscription.count(),
    db.pushSubscription.count({ where: { services: true } }),
    db.pushSubscription.count({ where: { events: true } }),
    db.pushSubscription.count({ where: { news: true } }),
    db.pushSubscription.count({ where: { userId: { not: null } } }),
  ]);
  const ready = pushConfigured();
  const stats = [
    { label: "Appareils abonnés", value: total },
    { label: "dont membres connectés", value: members },
    { label: "Rappels des cultes", value: services },
    { label: "Événements", value: events },
    { label: "Annonces", value: news },
  ];

  return (
    <>
      <AdminTitle title="Notifications" text="Rappels automatiques la veille et 1 h avant chaque culte et événement, et messages ponctuels." />
      {!ready && (
        <Panel className="mb-6 border-amber-300 bg-amber-50">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Les notifications ne sont pas encore activées sur le serveur : il faut renseigner les clés VAPID (voir le README, section « Rappels »).
          </p>
        </Panel>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-night-950 p-5 text-white">
            <Smartphone className="size-4 text-gold-300" />
            <p className="mt-3 font-serif text-4xl font-semibold">{s.value}</p>
            <p className="text-sm text-white/65">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-semibold text-night-900"><BellRing className="size-5 text-gold-600" /> Envoyer un message</h2>
          <BroadcastForm />
        </Panel>
        <Panel>
          <h2 className="mb-2 font-serif text-2xl font-semibold text-night-900">Rappels automatiques</h2>
          <p className="mb-4 text-sm leading-relaxed text-night-800/70">
            Le serveur vérifie toutes les 15 minutes s&apos;il y a un culte ou un événement dans les prochaines 24 h ou dans l&apos;heure, et prévient les abonnés une seule fois par rappel.
          </p>
          <RunRemindersButton />
        </Panel>
      </div>
    </>
  );
}
