"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { registerToEvent } from "@/actions/events";
import { FieldError, FormMessage, SubmitButton, kept } from "../forms/ui";

export function RegistrationForm({ eventId, defaults, remaining }: { eventId: string; defaults?: { name: string; phone: string }; remaining: number | null }) {
  const [state, action] = useActionState(registerToEvent, undefined);

  if (state?.ok) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <motion.div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-emerald-500 text-2xl text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }}>
          ✓
        </motion.div>
        <p className="font-semibold text-emerald-900">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-night-900/10 bg-white p-6">
      <input type="hidden" name="eventId" value={eventId} />
      <div>
        <label className="label" htmlFor="reg-name">Nom complet</label>
        <input id="reg-name" name="name" className="field" required defaultValue={kept(state, "name", defaults?.name)} />
        <FieldError state={state} name="name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <div>
          <label className="label" htmlFor="reg-phone">Téléphone</label>
          <input id="reg-phone" name="phone" type="tel" className="field" required defaultValue={kept(state, "phone", defaults?.phone)} />
          <FieldError state={state} name="phone" />
        </div>
        <div>
          <label className="label" htmlFor="reg-guests">Accompagnants</label>
          <input id="reg-guests" name="guests" type="number" min={0} max={10} className="field" defaultValue={kept(state, "guests", 0)} />
        </div>
      </div>
      {remaining !== null && <p className="text-sm text-night-800/60">{remaining} place{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}</p>}
      <FormMessage state={state} />
      <SubmitButton className="w-full">Je m&apos;inscris</SubmitButton>
    </form>
  );
}
