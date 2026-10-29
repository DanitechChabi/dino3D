"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveEvent } from "@/actions/admin";
import { FieldError, FormMessage, SubmitButton, kept, keptCheck, formKey } from "../forms/ui";

export type EventFormValues = {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  coverUrl: string;
  program: string;
  capacity: string;
  ministryId: string;
  articleSlug: string;
  registrationOpen: boolean;
  published: boolean;
};

type Props = {
  event?: EventFormValues;
  categories: string[];
  ministries: { id: string; name: string }[];
  articles: { slug: string; title: string }[];
  photos: string[];
};

export function EventForm({ event, categories, ministries, articles, photos }: Props) {
  const [state, action] = useActionState(saveEvent, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !event) ref.current?.reset();
  }, [state, event]);

  return (
    <form key={formKey(state)} ref={ref} action={action} className="grid gap-4 sm:grid-cols-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="sm:col-span-4">
        <label className="label">Titre</label>
        <input name="title" className="field" required defaultValue={kept(state, "title", event?.title)} />
        <FieldError state={state} name="title" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Catégorie</label>
        <select name="category" className="field" defaultValue={kept(state, "category", event?.category ?? "Culte spécial")}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Début</label>
        <input name="startAt" type="datetime-local" className="field" required defaultValue={kept(state, "startAt", event?.startAt)} />
        <FieldError state={state} name="startAt" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Fin (facultatif)</label>
        <input name="endAt" type="datetime-local" className="field" defaultValue={kept(state, "endAt", event?.endAt)} />
        <FieldError state={state} name="endAt" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Lieu</label>
        <input name="location" className="field" required defaultValue={kept(state, "location", event?.location ?? "EBB-JR de Tanmey")} />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Résumé (une ou deux phrases)</label>
        <input name="summary" className="field" required maxLength={300} defaultValue={kept(state, "summary", event?.summary)} />
        <FieldError state={state} name="summary" />
      </div>
      <div className="sm:col-span-6">
        <label className="label">Description</label>
        <textarea name="description" rows={5} className="field resize-y" defaultValue={kept(state, "description", event?.description)} />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Programme (une ligne par étape)</label>
        <textarea
          name="program"
          rows={6}
          className="field resize-y font-mono text-sm"
          placeholder={"09:00 Accueil et louange\n09:45 Prédication\n11:30 Questions et réponses"}
          defaultValue={kept(state, "program", event?.program)}
        />
      </div>
      <div className="space-y-4 sm:col-span-3">
        <div>
          <label className="label">Image (photo de la galerie ou lien https)</label>
          <input name="coverUrl" list="gallery-photos" className="field" placeholder="/galerie/…" defaultValue={kept(state, "coverUrl", event?.coverUrl)} />
          <datalist id="gallery-photos">
            {photos.map((p) => <option key={p} value={p} />)}
          </datalist>
          <FieldError state={state} name="coverUrl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ministère</label>
            <select name="ministryId" className="field" defaultValue={kept(state, "ministryId", event?.ministryId)}>
              <option value="">—</option>
              {ministries.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Places max.</label>
            <input name="capacity" type="number" min={1} className="field" placeholder="Illimité" defaultValue={kept(state, "capacity", event?.capacity)} />
          </div>
        </div>
        <div>
          <label className="label">Récit sur le blog (après l&apos;événement)</label>
          <select name="articleSlug" className="field" defaultValue={kept(state, "articleSlug", event?.articleSlug)}>
            <option value="">—</option>
            {articles.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-5 text-sm text-night-800 sm:col-span-6">
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={keptCheck(state, "published", event?.published ?? true)} className="size-4 accent-gold-500" /> Publié</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="registrationOpen" defaultChecked={keptCheck(state, "registrationOpen", event?.registrationOpen)} className="size-4 accent-gold-500" /> Inscriptions ouvertes</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notify" defaultChecked={keptCheck(state, "notify", !event)} className="size-4 accent-gold-500" /> Notifier les abonnés</label>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <SubmitButton>{event ? "Enregistrer" : "Créer l'événement"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
