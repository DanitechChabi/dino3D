"use client";

import { useState, useTransition } from "react";
import { Ban, Radio, Square, Trash2 } from "lucide-react";
import { cancelLive, deleteLive, endLive, startLive } from "@/actions/lives";

export function LiveActions({ id, status }: { id: string; status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED" }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const btn = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "SCHEDULED" && (
        <button disabled={pending} onClick={() => start(async () => setMessage((await startLive(id)).message))} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>
          <Radio className="size-3.5" /> Démarrer le direct
        </button>
      )}
      {status === "LIVE" && (
        <button disabled={pending} onClick={() => confirm("Terminer le direct ?") && start(() => endLive(id))} className={`${btn} bg-night-950 text-white`}>
          <Square className="size-3.5" /> Terminer
        </button>
      )}
      {status === "SCHEDULED" && (
        <button disabled={pending} onClick={() => confirm("Annuler ce direct ?") && start(() => cancelLive(id))} className={`${btn} border border-night-900/15 text-night-800`}>
          <Ban className="size-3.5" /> Annuler
        </button>
      )}
      {status !== "LIVE" && (
        <button disabled={pending} onClick={() => confirm("Supprimer définitivement ?") && start(() => deleteLive(id))} className={`${btn} text-red-700 hover:bg-red-50`}>
          <Trash2 className="size-3.5" /> Supprimer
        </button>
      )}
      {message && <span className="text-xs font-semibold text-night-800">{message}</span>}
    </div>
  );
}
