"use client";

import { useActionState, useState, useTransition } from "react";
import { runRemindersNow, sendBroadcast } from "@/actions/admin";
import { FieldError, FormMessage, SubmitButton, kept } from "../forms/ui";

export function BroadcastForm() {
  const [state, action] = useActionState(sendBroadcast, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">Destinataires</label>
        <select name="audience" className="field" defaultValue={kept(state, "audience", "news")}>
          <option value="news">Abonnés aux annonces importantes</option>
          <option value="events">Abonnés aux événements</option>
          <option value="services">Abonnés aux rappels des cultes</option>
        </select>
      </div>
      <div>
        <label className="label">Titre</label>
        <input name="title" className="field" maxLength={80} required defaultValue={kept(state, "title")} />
        <FieldError state={state} name="title" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="body" rows={3} maxLength={200} className="field resize-y" required defaultValue={kept(state, "body")} />
        <FieldError state={state} name="body" />
      </div>
      <div>
        <label className="label">Page ouverte au clic (facultatif)</label>
        <input name="url" className="field" placeholder="/evenements" defaultValue={kept(state, "url")} />
        <FieldError state={state} name="url" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Envoyer la notification</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function RunRemindersButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string[] | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() => start(async () => setResult(await runRemindersNow()))}
        className="rounded-full border border-night-900/15 bg-white px-4 py-2 text-sm font-bold text-night-900 hover:border-gold-400 disabled:opacity-50"
      >
        {pending ? "Vérification…" : "Envoyer les rappels dus maintenant"}
      </button>
      {result && <p className="mt-2 text-sm text-night-800/70">{result.length ? result.join(" · ") : "Aucun rappel à envoyer pour le moment."}</p>}
    </div>
  );
}
