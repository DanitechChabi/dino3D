"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveAnnouncement } from "@/actions/admin";
import { FieldError, FormMessage, SubmitButton, kept, keptCheck } from "../forms/ui";

type A = { id: string; title: string; body: string; pinned: boolean; published: boolean };

export function AnnouncementForm({ announcement }: { announcement?: A }) {
  const [state, action] = useActionState(saveAnnouncement, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !announcement) ref.current?.reset();
  }, [state, announcement]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      {announcement && <input type="hidden" name="id" value={announcement.id} />}
      <div>
        <label className="label">Titre</label>
        <input name="title" className="field" defaultValue={kept(state, "title", announcement?.title)} required />
        <FieldError state={state} name="title" />
      </div>
      <div>
        <label className="label">Texte</label>
        <textarea name="body" rows={5} className="field resize-y" defaultValue={kept(state, "body", announcement?.body)} required />
        <FieldError state={state} name="body" />
      </div>
      <div className="flex flex-wrap gap-5 text-sm text-night-800">
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={keptCheck(state, "published", announcement?.published ?? true)} className="size-4 accent-gold-500" /> Publiée</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="pinned" defaultChecked={keptCheck(state, "pinned", announcement?.pinned)} className="size-4 accent-gold-500" /> Épinglée en haut</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notify" defaultChecked={keptCheck(state, "notify", false)} className="size-4 accent-gold-500" /> Envoyer une notification aux abonnés</label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{announcement ? "Enregistrer" : "Publier"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
