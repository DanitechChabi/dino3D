import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { HandledToggle } from "@/components/admin/HandledToggle";

export const metadata: Metadata = { title: "Messages & prières" };

export default async function MessagesAdmin() {
  const user = await requireRole("RESPONSABLE");
  const isAdmin = user.role === "ADMIN";
  const messages = await db.contactMessage.findMany({
    where: isAdmin ? {} : { isPrayer: false },
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });
  return (
    <>
      <AdminTitle
        title="Messages & prières"
        text={isAdmin ? "Messages du formulaire de contact et demandes de prière (confidentielles)." : "Messages du formulaire de contact. Les demandes de prière sont réservées au pasteur."}
      />
      {messages.length === 0 && <Panel><p className="text-night-800/60">Aucun message pour le moment.</p></Panel>}
      <div className="space-y-4">
        {messages.map((m) => (
          <Panel key={m.id} className={m.handled ? "opacity-70" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-serif text-xl font-semibold text-night-900">
                  {!m.handled && <span className="size-2 rounded-full bg-gold-500" />}
                  {m.subject}
                  {m.isPrayer && <span className="rounded-full bg-gold-300/40 px-2 py-0.5 font-sans text-xs font-bold text-gold-600">Prière</span>}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-night-800/60">
                  <span className="font-semibold text-night-900">{m.name}</span>
                  {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-gold-600"><Phone className="size-3.5" />{m.phone}</a>}
                  {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-gold-600"><Mail className="size-3.5" />{m.email}</a>}
                  <span>{m.createdAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span>
                </p>
              </div>
              <HandledToggle id={m.id} handled={m.handled} />
            </div>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-night-800">{m.message}</p>
          </Panel>
        ))}
      </div>
    </>
  );
}
