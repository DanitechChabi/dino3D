"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { CreditCard, Smartphone } from "lucide-react";
import { startDonation } from "@/actions/giving";
import { MIN_AMOUNT, formatXOF } from "@/lib/money";
import { FieldError, FormMessage, SubmitButton, kept, keptCheck } from "../forms/ui";

const PRESETS = [1000, 2000, 5000, 10000, 20000];

export function SolidarityGiveForm({ caseId, user, methods }: { caseId: string; user: { name: string; phone: string } | null; methods: ("MOBILE_MONEY" | "CARD")[] }) {
  const [state, action] = useActionState(startDonation, undefined);
  const [amount, setAmount] = useState<number>(Number(kept(state, "amount", 5000)));
  const [method, setMethod] = useState<"MOBILE_MONEY" | "CARD">((kept(state, "method", methods[0]) as "MOBILE_MONEY" | "CARD") ?? "MOBILE_MONEY");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="solidarityId" value={caseId} />
      <input type="hidden" name="method" value={method} />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((v) => (
          <motion.button
            type="button"
            key={v}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAmount(v)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${amount === v ? "bg-gold-400 text-night-950" : "bg-night-900/5 text-night-900 hover:bg-night-900/10"}`}
          >
            {v.toLocaleString("fr-FR")}
          </motion.button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="s-amount">Montant (F CFA)</label>
        <input id="s-amount" name="amount" type="number" min={MIN_AMOUNT} inputMode="numeric" className="field text-lg font-bold" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
        <FieldError state={state} name="amount" />
      </div>
      <div className="flex gap-2 rounded-full bg-night-900/5 p-1">
        {methods.map((m) => (
          <button type="button" key={m} onClick={() => setMethod(m)} className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-bold ${method === m ? "text-night-950" : "text-night-800/60"}`}>
            {method === m && <motion.span layoutId="sol-method" className="absolute inset-0 rounded-full bg-white shadow" />}
            <span className="relative flex items-center gap-2">{m === "MOBILE_MONEY" ? <Smartphone className="size-4" /> : <CreditCard className="size-4" />}{m === "MOBILE_MONEY" ? "Mobile Money" : "Carte"}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="s-name">Nom</label>
          <input id="s-name" name="name" className="field" defaultValue={kept(state, "name", user?.name)} />
          <FieldError state={state} name="name" />
        </div>
        <div>
          <label className="label" htmlFor="s-phone">{method === "MOBILE_MONEY" ? "Numéro Mobile Money" : "Téléphone"}</label>
          <input id="s-phone" name="phone" type="tel" className="field" defaultValue={kept(state, "phone", user?.phone)} />
          <FieldError state={state} name="phone" />
        </div>
      </div>
      <input name="note" className="field" maxLength={300} placeholder="Un mot d'encouragement (facultatif)" defaultValue={kept(state, "note")} />
      <label className="flex items-center gap-2 text-sm text-night-800">
        <input type="checkbox" name="anonymous" defaultChecked={keptCheck(state, "anonymous", false)} className="size-4 accent-gold-500" /> Don anonyme
      </label>
      <FormMessage state={state} />
      <SubmitButton className="w-full py-3.5">Soutenir {amount >= MIN_AMOUNT ? `avec ${formatXOF(amount)}` : ""}</SubmitButton>
    </form>
  );
}
