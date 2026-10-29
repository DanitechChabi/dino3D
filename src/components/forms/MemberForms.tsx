"use client";

import { useActionState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { changePassword, toggleMinistry, updateProfile } from "@/actions/member";
import { FieldError, FormMessage, SubmitButton, kept } from "./ui";
import { MinistryIcon } from "../MinistryIcon";

type Profile = { firstName: string; lastName: string; email: string | null; birthDate: string };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">Prénom</label>
          <input id="firstName" name="firstName" className="field" defaultValue={kept(state, "firstName", profile.firstName)} required />
          <FieldError state={state} name="firstName" />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input id="lastName" name="lastName" className="field" defaultValue={kept(state, "lastName", profile.lastName)} required />
          <FieldError state={state} name="lastName" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="field" defaultValue={kept(state, "email", profile.email ?? "")} />
          <FieldError state={state} name="email" />
        </div>
        <div>
          <label className="label" htmlFor="birthDate">Date de naissance</label>
          <input id="birthDate" name="birthDate" type="date" className="field" defaultValue={kept(state, "birthDate", profile.birthDate)} />
          <FieldError state={state} name="birthDate" />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="current">Mot de passe actuel</label>
        <input id="current" name="current" type="password" className="field" autoComplete="current-password" required />
        <FieldError state={state} name="current" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Nouveau</label>
          <input id="password" name="password" type="password" className="field" autoComplete="new-password" required minLength={8} />
          <FieldError state={state} name="password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirmation</label>
          <input id="confirm" name="confirm" type="password" className="field" autoComplete="new-password" required />
          <FieldError state={state} name="confirm" />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Changer le mot de passe</SubmitButton>
    </form>
  );
}

export function MinistryToggles({ ministries }: { ministries: { id: string; name: string; icon: string; joined: boolean }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ministries.map((m) => (
        <motion.button
          key={m.id}
          whileTap={{ scale: 0.97 }}
          disabled={pending}
          onClick={() => start(() => toggleMinistry(m.id))}
          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
            m.joined ? "border-gold-500 bg-gold-300/20" : "border-night-900/10 bg-white hover:border-gold-400"
          }`}
        >
          <span className={`grid size-10 place-items-center rounded-xl ${m.joined ? "bg-night-950 text-gold-300" : "bg-parchment text-night-800"}`}>
            <MinistryIcon name={m.icon} className="size-5" />
          </span>
          <span className="flex-1 text-sm font-semibold text-night-900">{m.name}</span>
          {m.joined ? <Check className="size-4 text-gold-600" /> : <Plus className="size-4 text-night-800/40" />}
        </motion.button>
      ))}
    </div>
  );
}
