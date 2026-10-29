"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CreditCard, Lock, Smartphone } from "lucide-react";
import { startDonation } from "@/actions/giving";
import { AMOUNT_PRESETS, MIN_AMOUNT, formatXOF } from "@/lib/money";
import { FieldError, FormMessage, SubmitButton, kept, keptCheck } from "../forms/ui";

type Category = { id: string; name: string; description: string; confidential: boolean };

/** Formulaire de don : type, montant, moyen de paiement, coordonnées. */
export function GivingForm({
  categories,
  initialCategory,
  user,
  methods,
  testMode,
}: {
  categories: Category[];
  initialCategory?: string;
  user: { name: string; phone: string } | null;
  methods: ("MOBILE_MONEY" | "CARD")[];
  testMode: boolean;
}) {
  const [state, action] = useActionState(startDonation, undefined);
  const [category, setCategory] = useState(kept(state, "categoryId", initialCategory ?? categories[0]?.id) as string);
  const [amount, setAmount] = useState<number>(Number(kept(state, "amount", 5000)));
  const [method, setMethod] = useState<"MOBILE_MONEY" | "CARD">((kept(state, "method", methods[0]) as "MOBILE_MONEY" | "CARD") ?? "MOBILE_MONEY");
  const selected = categories.find((c) => c.id === category);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="categoryId" value={category} />
      <input type="hidden" name="method" value={method} />

      {/* 1. Type de don */}
      <fieldset>
        <legend className="mb-3 font-serif text-2xl font-semibold text-night-900">1. Je donne pour…</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const active = c.id === category;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                aria-pressed={active}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-colors ${active ? "border-gold-500 text-white" : "border-night-900/10 bg-white text-night-900 hover:border-gold-400"}`}
              >
                {active && <motion.span layoutId="giving-cat" className="absolute inset-0 bg-gradient-to-br from-night-800 to-night-950" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                <span className="relative block font-bold">{c.name}</span>
                <span className={`relative mt-1 block text-xs leading-relaxed ${active ? "text-white/70" : "text-night-800/60"}`}>{c.description}</span>
                {c.confidential && <span className={`relative mt-2 inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider ${active ? "text-gold-300" : "text-gold-600"}`}><Lock className="size-3" /> Confidentiel</span>}
              </button>
            );
          })}
        </div>
        <FieldError state={state} name="categoryId" />
      </fieldset>

      {/* 2. Montant */}
      <fieldset>
        <legend className="mb-3 font-serif text-2xl font-semibold text-night-900">2. Montant</legend>
        <div className="rounded-3xl bg-night-950 p-6 text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={amount}
              initial={{ y: 20, opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -20, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="text-gold-sheen font-serif text-5xl font-semibold tabular-nums sm:text-6xl"
            >
              {formatXOF(amount || 0)}
            </motion.p>
          </AnimatePresence>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {AMOUNT_PRESETS.map((v) => (
              <motion.button
                type="button"
                key={v}
                whileTap={{ scale: 0.94 }}
                onClick={() => setAmount(v)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${amount === v ? "bg-gold-400 text-night-950" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {v.toLocaleString("fr-FR")}
              </motion.button>
            ))}
          </div>
          <label className="mx-auto mt-4 block max-w-xs text-left">
            <span className="mb-1 block text-xs font-semibold text-white/60">Autre montant (F CFA)</span>
            <input
              name="amount"
              type="number"
              inputMode="numeric"
              min={MIN_AMOUNT}
              step={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-lg font-bold text-white outline-none focus:border-gold-400"
            />
          </label>
          <FieldError state={state} name="amount" />
        </div>
      </fieldset>

      {/* 3. Paiement et coordonnées */}
      <fieldset className="space-y-4">
        <legend className="mb-3 font-serif text-2xl font-semibold text-night-900">3. Paiement</legend>
        <div className="flex gap-2 rounded-full bg-night-900/5 p-1">
          {methods.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMethod(m)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold ${method === m ? "text-night-950" : "text-night-800/60"}`}
            >
              {method === m && <motion.span layoutId="giving-method" className="absolute inset-0 rounded-full bg-white shadow" />}
              <span className="relative flex items-center gap-2">
                {m === "MOBILE_MONEY" ? <Smartphone className="size-4" /> : <CreditCard className="size-4" />}
                {m === "MOBILE_MONEY" ? "Mobile Money" : "Carte bancaire"}
              </span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="g-name">Nom complet</label>
            <input id="g-name" name="name" className="field" defaultValue={kept(state, "name", user?.name)} autoComplete="name" />
            <FieldError state={state} name="name" />
          </div>
          <div>
            <label className="label" htmlFor="g-phone">{method === "MOBILE_MONEY" ? "Numéro Mobile Money" : "Téléphone (facultatif)"}</label>
            <input id="g-phone" name="phone" type="tel" className="field" defaultValue={kept(state, "phone", user?.phone)} autoComplete="tel" />
            <FieldError state={state} name="phone" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="g-note">Message (facultatif)</label>
          <input id="g-note" name="note" className="field" maxLength={300} placeholder="Ex. : action de grâce pour la naissance de ma fille" defaultValue={kept(state, "note")} />
        </div>
        <label className="flex items-center gap-3 text-sm text-night-800">
          <input type="checkbox" name="anonymous" defaultChecked={keptCheck(state, "anonymous", false)} className="size-5 accent-gold-500" />
          Rester anonyme (mon nom n&apos;apparaîtra pas dans les listes)
        </label>
      </fieldset>

      <div className="space-y-3">
        <FormMessage state={state} />
        <SubmitButton className="w-full py-4 text-base">
          Donner {amount >= MIN_AMOUNT ? formatXOF(amount) : ""}
          {selected ? ` · ${selected.name}` : ""}
        </SubmitButton>
        <p className="flex items-center justify-center gap-1.5 text-xs text-night-800/60">
          <Lock className="size-3.5" /> Paiement sécurisé. Un reçu vous est remis après confirmation.
        </p>
        {testMode && (
          <p className="rounded-2xl bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-800">
            Mode test : aucun paiement réel ne sera effectué.
          </p>
        )}
      </div>
    </form>
  );
}
