"use client";

import { useSyncExternalStore } from "react";
import { CalendarPlus } from "lucide-react";

/** Abonnement de l'agenda du téléphone au calendrier de l'église (mis à jour automatiquement). */
export function CalendarSubscribe({ dark = false }: { dark?: boolean }) {
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  const webcal = `webcal://${host}/calendrier.ics`;
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  const base = dark ? "border-white/20 text-white hover:bg-white/10" : "border-night-900/15 bg-white text-night-900 hover:border-gold-400";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={webcal} className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold ${base}`}>
        <CalendarPlus className="size-4" /> iPhone / Outlook
      </a>
      <a href={google} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold ${base}`}>
        <CalendarPlus className="size-4" /> Google Agenda (Android)
      </a>
    </div>
  );
}
