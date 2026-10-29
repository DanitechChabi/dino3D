"use client";

import { useActionState } from "react";
import { saveSettings } from "@/actions/settings";
import { FieldError, FormMessage, SubmitButton, kept } from "../forms/ui";

type Values = { address: string; mapQuery: string; whatsapp: string; facebook: string; youtube: string; whatsappChannel: string };

export function SettingsForm({ values }: { values: Values }) {
  const [state, action] = useActionState(saveSettings, undefined);
  const field = (name: keyof Values, label: string, hint?: string, placeholder?: string) => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" placeholder={placeholder} defaultValue={kept(state, name, values[name])} />
      {hint && <p className="mt-1 text-xs text-night-800/60">{hint}</p>}
      <FieldError state={state} name={name} />
    </div>
  );
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("address", "Adresse affichée", undefined, "Tanmey, à côté de …")}</div>
      <div className="sm:col-span-2">
        {field(
          "mapQuery",
          "Position sur la carte",
          "Sur Google Maps, appuyez longuement sur l'église : copiez les coordonnées affichées (ex. 6.4969, 2.6289). Laissez vide pour masquer la carte.",
          "6.4969, 2.6289",
        )}
      </div>
      {field("whatsapp", "Numéro WhatsApp de l'église", "Avec l'indicatif du pays : 229 01 97 60 97 49", "229 01 97 60 97 49")}
      {field("facebook", "Page Facebook", undefined, "https://www.facebook.com/…")}
      {field("youtube", "Chaîne YouTube", undefined, "https://www.youtube.com/@…")}
      {field("whatsappChannel", "Chaîne WhatsApp", undefined, "https://whatsapp.com/channel/…")}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <SubmitButton>Enregistrer</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
