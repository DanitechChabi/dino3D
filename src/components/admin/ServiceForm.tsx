"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveService } from "@/actions/admin";
import { FieldError, FormMessage, SubmitButton, kept } from "../forms/ui";
import { DAYS } from "@/content/site";

type Service = { id: string; name: string; description: string | null; dayOfWeek: number; weeks: number[]; startTime: string; endTime: string | null; location: string; order: number };

export function ServiceForm({ service }: { service?: Service }) {
  const [state, action] = useActionState(saveService, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !service) ref.current?.reset();
  }, [state, service]);

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-6">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="sm:col-span-3">
        <label className="label">Nom</label>
        <input name="name" className="field" defaultValue={kept(state, "name", service?.name)} required />
        <FieldError state={state} name="name" />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Lieu</label>
        <input name="location" className="field" defaultValue={kept(state, "location", service?.location ?? "Temple principal")} required />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Jour</label>
        <select name="dayOfWeek" className="field" defaultValue={kept(state, "dayOfWeek", service?.dayOfWeek ?? 0)}>
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Début</label>
        <input name="startTime" type="time" className="field" defaultValue={kept(state, "startTime", service?.startTime)} required />
        <FieldError state={state} name="startTime" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Fin</label>
        <input name="endTime" type="time" className="field" defaultValue={kept(state, "endTime", service?.endTime ?? "")} />
      </div>
      <fieldset className="sm:col-span-6">
        <legend className="label">Semaines du mois (aucune case cochée = chaque semaine)</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((w) => (
            <label key={w} className="flex cursor-pointer items-center gap-2 rounded-full border border-night-900/15 bg-white px-3 py-1.5 text-sm has-[:checked]:border-gold-500 has-[:checked]:bg-gold-300/30">
              <input type="checkbox" name="weeks" value={w} defaultChecked={service?.weeks.includes(w)} className="size-4 accent-gold-500" />
              {w === 1 ? "1re" : `${w}e`} semaine
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-5">
        <label className="label">Description</label>
        <input name="description" className="field" defaultValue={kept(state, "description", service?.description ?? "")} />
      </div>
      <div className="sm:col-span-1">
        <label className="label">Ordre</label>
        <input name="order" type="number" min={0} max={99} className="field" defaultValue={kept(state, "order", service?.order ?? 0)} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <SubmitButton>{service ? "Enregistrer" : "Ajouter"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
