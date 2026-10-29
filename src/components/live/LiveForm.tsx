"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { saveLive } from "@/actions/lives";
import { FieldError, FormMessage, SubmitButton, formKey, kept, keptCheck } from "../forms/ui";

export type LiveValues = {
  id: string;
  title: string;
  description: string;
  preacher: string;
  series: string;
  scripture: string;
  scheduledAt: string;
  url: string;
  published: boolean;
};

/** Programmer un direct, ajouter une prédication passée ou modifier une entrée. */
export function LiveForm({ live, defaultDate, seriesList }: { live?: LiveValues; defaultDate?: string; seriesList: string[] }) {
  const [state, action] = useActionState(saveLive, undefined);
  const [mode, setMode] = useState<"SCHEDULED" | "ENDED">("SCHEDULED");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !live) ref.current?.reset();
  }, [state, live]);

  return (
    <form ref={ref} key={formKey(state)} action={action} className="grid gap-4 sm:grid-cols-6">
      {live ? <input type="hidden" name="id" value={live.id} /> : <input type="hidden" name="status" value={mode} />}
      {!live && (
        <div className="flex gap-2 rounded-full bg-night-900/5 p-1 sm:col-span-6">
          {(["SCHEDULED", "ENDED"] as const).map((m) => (
            <button type="button" key={m} onClick={() => setMode(m)} className={`relative flex-1 rounded-full py-2 text-sm font-bold ${mode === m ? "text-night-950" : "text-night-800/60"}`}>
              {mode === m && <motion.span layoutId="live-mode" className="absolute inset-0 rounded-full bg-white shadow" />}
              <span className="relative">{m === "SCHEDULED" ? "Programmer un direct" : "Ajouter une prédication passée"}</span>
            </button>
          ))}
        </div>
      )}
      <div className="sm:col-span-4">
        <label className="label">Titre</label>
        <input name="title" className="field" placeholder="Culte du dimanche — La fidélité de Dieu" defaultValue={kept(state, "title", live?.title)} />
        <FieldError state={state} name="title" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">{mode === "ENDED" && !live ? "Date de la prédication" : "Date et heure"}</label>
        <input name="scheduledAt" type="datetime-local" className="field" defaultValue={kept(state, "scheduledAt", live?.scheduledAt ?? defaultDate)} />
        <FieldError state={state} name="scheduledAt" />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Lien YouTube ou Facebook {mode === "SCHEDULED" && !live && "(peut être ajouté juste avant le direct)"}</label>
        <input name="url" className="field" placeholder="https://www.youtube.com/live/…" defaultValue={kept(state, "url", live?.url)} />
        <FieldError state={state} name="url" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Prédicateur</label>
        <input name="preacher" className="field" defaultValue={kept(state, "preacher", live?.preacher ?? "Pasteur CHABI BOUKO Youssouf")} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Série (facultatif)</label>
        <input name="series" list="series-list" className="field" defaultValue={kept(state, "series", live?.series)} />
        <datalist id="series-list">{seriesList.map((s) => <option key={s} value={s} />)}</datalist>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Passage biblique</label>
        <input name="scripture" className="field" placeholder="Jean 3:16" defaultValue={kept(state, "scripture", live?.scripture)} />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Description</label>
        <textarea name="description" rows={3} className="field resize-y" defaultValue={kept(state, "description", live?.description)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-night-800 sm:col-span-6">
        <input type="checkbox" name="published" defaultChecked={keptCheck(state, "published", live?.published ?? true)} className="size-4 accent-gold-500" /> Publié sur le site
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <SubmitButton>{live ? "Enregistrer" : mode === "ENDED" ? "Ajouter aux archives" : "Programmer"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
