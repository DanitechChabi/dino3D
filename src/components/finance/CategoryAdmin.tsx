"use client";

import { useActionState, useTransition } from "react";
import { Lock } from "lucide-react";
import { addGivingCategory, toggleGivingCategory } from "@/actions/finance";
import { FieldError, FormMessage, SubmitButton, kept } from "../forms/ui";

export function CategoryAdmin({ categories }: { categories: { id: string; name: string; confidential: boolean; active: boolean }[] }) {
  const [state, action] = useActionState(addGivingCategory, undefined);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-5">
      <ul className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.id}>
            <button
              disabled={pending}
              onClick={() => start(() => toggleGivingCategory(c.id, !c.active))}
              title={c.active ? "Désactiver" : "Réactiver"}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${c.active ? "bg-gold-300/40 text-night-900" : "bg-night-900/5 text-night-800/40 line-through"}`}
            >
              {c.confidential && <Lock className="size-3.5" />}
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <div>
          <input name="name" className="field" placeholder="Nouveau type" defaultValue={kept(state, "name")} />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <input name="description" className="field" placeholder="Description affichée aux donateurs" defaultValue={kept(state, "description")} />
          <FieldError state={state} name="description" />
        </div>
        <SubmitButton>Ajouter</SubmitButton>
        <label className="flex items-center gap-2 text-sm text-night-800 sm:col-span-3">
          <input type="checkbox" name="confidential" className="size-4 accent-gold-500" /> Confidentiel (comme la dîme)
        </label>
        <div className="sm:col-span-3"><FormMessage state={state} /></div>
      </form>
    </div>
  );
}
