"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeartHandshake, Lock } from "lucide-react";
import { requestHelp } from "@/actions/solidarity";
import { FieldError, FormMessage, SubmitButton, formKey, kept } from "../forms/ui";

const VIS = [
  { value: "ANONYMOUS", label: "Anonyme", text: "La collecte est visible, mais le nom n'apparaît pas." },
  { value: "MEMBERS", label: "Membres seulement", text: "Seuls les membres connectés voient la collecte." },
  { value: "PUBLIC", label: "Publique", text: "Visible de tous, nom compris." },
];

export function HelpRequestForm({ reasons, phone }: { reasons: string[]; phone: string }) {
  const [state, action] = useActionState(requestHelp, undefined);
  const [forSelf, setForSelf] = useState(kept(state, "forSelf", "oui") === "oui");

  if (state?.ok) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-gold-500/30 bg-white p-8 text-center">
        <HeartHandshake className="mx-auto size-12 text-gold-500" />
        <p className="mt-4 font-serif text-2xl text-night-900">{state.message}</p>
        <p className="mt-3 text-sm italic text-night-800/70">« Portez les fardeaux les uns des autres. » — Galates 6:2</p>
      </motion.div>
    );
  }

  return (
    <form key={formKey(state)} action={action} className="space-y-5 rounded-3xl border border-night-900/10 bg-white p-6 sm:p-8">
      <p className="flex items-start gap-2 rounded-2xl bg-parchment p-4 text-sm text-night-800">
        <Lock className="mt-0.5 size-4 shrink-0 text-gold-600" />
        Votre demande n&apos;est lue que par le pasteur et le trésorier. Rien n&apos;est publié sans leur accord, et vous choisissez le niveau de discrétion.
      </p>
      <input type="hidden" name="forSelf" value={forSelf ? "oui" : "non"} />
      <div className="flex gap-2 rounded-full bg-night-900/5 p-1">
        {[true, false].map((v) => (
          <button type="button" key={String(v)} onClick={() => setForSelf(v)} className={`relative flex-1 rounded-full py-2.5 text-sm font-bold ${forSelf === v ? "text-night-950" : "text-night-800/60"}`}>
            {forSelf === v && <motion.span layoutId="help-for" className="absolute inset-0 rounded-full bg-white shadow" />}
            <span className="relative">{v ? "Pour moi" : "Pour un frère ou une sœur"}</span>
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {!forSelf && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <label className="label" htmlFor="h-name">Nom de la personne à aider</label>
            <input id="h-name" name="beneficiaryName" className="field" defaultValue={kept(state, "beneficiaryName")} />
            <FieldError state={state} name="beneficiaryName" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="h-reason">Motif</label>
          <select id="h-reason" name="reason" className="field" defaultValue={kept(state, "reason", reasons[0])}>
            {reasons.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="h-estimate">Besoin estimé (F CFA, facultatif)</label>
          <input id="h-estimate" name="estimate" type="number" min={0} className="field" defaultValue={kept(state, "estimate")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="h-story">La situation</label>
        <textarea id="h-story" name="story" rows={5} className="field resize-y" placeholder="Expliquez simplement le besoin." defaultValue={kept(state, "story")} />
        <FieldError state={state} name="story" />
      </div>
      <fieldset>
        <legend className="label">Discrétion souhaitée si une collecte est ouverte</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VIS.map((v) => (
            <label key={v.value} className="cursor-pointer rounded-2xl border border-night-900/10 p-3 text-sm has-[:checked]:border-gold-500 has-[:checked]:bg-gold-300/20">
              <input type="radio" name="visibility" value={v.value} defaultChecked={kept(state, "visibility", "ANONYMOUS") === v.value} className="sr-only" />
              <span className="block font-bold text-night-900">{v.label}</span>
              <span className="text-xs text-night-800/60">{v.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="h-phone">Téléphone pour vous joindre</label>
        <input id="h-phone" name="contactPhone" type="tel" className="field" defaultValue={kept(state, "contactPhone", phone)} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Envoyer ma demande</SubmitButton>
    </form>
  );
}
