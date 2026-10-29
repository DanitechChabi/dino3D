"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "motion/react";
import { login, register } from "@/actions/auth";
import { FieldError, FormMessage, SubmitButton, kept } from "./ui";

const stagger = {
  initial: "hidden",
  animate: "show",
  variants: { show: { transition: { staggerChildren: 0.07 } } },
} as const;
const item = { variants: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } } };

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <motion.form action={action} className="space-y-5" {...stagger}>
      {next && <input type="hidden" name="suite" value={next} />}
      <motion.div {...item}>
        <h1 className="font-serif text-4xl font-semibold text-night-900">Bon retour parmi nous</h1>
        <p className="mt-2 text-night-800/70">Connectez-vous à votre espace membre.</p>
      </motion.div>
      <motion.div {...item}>
        <label className="label" htmlFor="phone">Numéro de téléphone</label>
        <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" required defaultValue={kept(state, "phone")} />
        <FieldError state={state} name="phone" />
      </motion.div>
      <motion.div {...item}>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
        <FieldError state={state} name="password" />
      </motion.div>
      <motion.div {...item} className="space-y-4">
        <FormMessage state={state} />
        <SubmitButton className="w-full">Se connecter</SubmitButton>
        <p className="text-center text-sm text-night-800/70">
          Pas encore de compte ? <Link href="/inscription" className="font-bold text-gold-600">Créer mon compte</Link>
        </p>
      </motion.div>
    </motion.form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  return (
    <motion.form action={action} className="space-y-5" {...stagger}>
      <motion.div {...item}>
        <h1 className="font-serif text-4xl font-semibold text-night-900">Rejoindre la famille</h1>
        <p className="mt-2 text-night-800/70">Créez votre compte membre pour suivre la vie de l&apos;église.</p>
      </motion.div>
      <motion.div {...item} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">Prénom</label>
          <input id="firstName" name="firstName" className="field" autoComplete="given-name" required defaultValue={kept(state, "firstName")} />
          <FieldError state={state} name="firstName" />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Nom</label>
          <input id="lastName" name="lastName" className="field" autoComplete="family-name" required defaultValue={kept(state, "lastName")} />
          <FieldError state={state} name="lastName" />
        </div>
      </motion.div>
      <motion.div {...item}>
        <label className="label" htmlFor="phone">Numéro de téléphone</label>
        <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" required defaultValue={kept(state, "phone")} />
        <FieldError state={state} name="phone" />
      </motion.div>
      <motion.div {...item}>
        <label className="label" htmlFor="email">E-mail (facultatif)</label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" defaultValue={kept(state, "email")} />
        <FieldError state={state} name="email" />
      </motion.div>
      <motion.div {...item} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" className="field" autoComplete="new-password" required minLength={8} />
          <FieldError state={state} name="password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirmation</label>
          <input id="confirm" name="confirm" type="password" className="field" autoComplete="new-password" required />
          <FieldError state={state} name="confirm" />
        </div>
      </motion.div>
      <motion.div {...item} className="space-y-4">
        <FormMessage state={state} />
        <SubmitButton className="w-full">Créer mon compte</SubmitButton>
        <p className="text-center text-sm text-night-800/70">
          Déjà membre ? <Link href="/connexion" className="font-bold text-gold-600">Se connecter</Link>
        </p>
      </motion.div>
    </motion.form>
  );
}
