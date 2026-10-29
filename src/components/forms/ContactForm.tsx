"use client";

import { useActionState } from "react";
import { sendContact } from "@/actions/contact";
import { FieldError, FormMessage, SubmitButton, kept, keptCheck } from "./ui";

export function ContactForm({ prayer, subject }: { prayer: boolean; subject?: string }) {
  const [state, action] = useActionState(sendContact, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-gold-500/30 bg-white p-8 text-center">
        <FormMessage state={state} />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-night-900/10 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(7,13,36,.5)] sm:p-8">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nom complet *</label>
          <input id="name" name="name" className="field" required autoComplete="name" defaultValue={kept(state, "name")} />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Téléphone / WhatsApp</label>
          <input id="phone" name="phone" className="field" type="tel" autoComplete="tel" defaultValue={kept(state, "phone")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" className="field" type="email" autoComplete="email" defaultValue={kept(state, "email")} />
        <FieldError state={state} name="email" />
      </div>
      <div>
        <label className="label" htmlFor="subject">Sujet *</label>
        <input id="subject" name="subject" className="field" required defaultValue={kept(state, "subject", prayer ? "Demande de prière" : subject)} />
        <FieldError state={state} name="subject" />
      </div>
      <div>
        <label className="label" htmlFor="message">Message *</label>
        <textarea id="message" name="message" rows={6} className="field resize-y" required placeholder={prayer ? "Partagez votre sujet de prière. Il restera confidentiel." : ""} defaultValue={kept(state, "message")} />
        <FieldError state={state} name="message" />
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-night-800">
        <input type="checkbox" name="isPrayer" defaultChecked={keptCheck(state, "isPrayer", prayer)} className="size-5 accent-gold-500" />
        C&apos;est une demande de prière (transmise uniquement au pasteur)
      </label>
      <FormMessage state={state} />
      <SubmitButton className="w-full sm:w-auto">Envoyer</SubmitButton>
    </form>
  );
}
