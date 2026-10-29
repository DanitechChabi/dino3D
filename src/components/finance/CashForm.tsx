"use client";

import { useActionState, useEffect, useRef } from "react";
import { recordCashDonation } from "@/actions/finance";
import { FieldError, FormMessage, SubmitButton, kept, formKey } from "../forms/ui";

export function CashForm({ categories, today, members }: { categories: { id: string; name: string }[]; today: string; members: { phone: string; name: string }[] }) {
  const [state, action] = useActionState(recordCashDonation, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form key={formKey(state)} ref={ref} action={action} className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <label className="label">Type</label>
        <select name="categoryId" className="field" defaultValue={kept(state, "categoryId", categories.find((c) => c.name.startsWith("Quête"))?.id)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-3">
        <label className="label">Montant (F CFA)</label>
        <input name="amount" type="number" min={1} inputMode="numeric" className="field" required defaultValue={kept(state, "amount")} />
        <FieldError state={state} name="amount" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Date du culte</label>
        <input name="serviceDate" type="date" className="field" required defaultValue={kept(state, "serviceDate", today)} />
        <FieldError state={state} name="serviceDate" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Moyen</label>
        <select name="method" className="field" defaultValue={kept(state, "method", "CASH")}>
          <option value="CASH">Espèces</option>
          <option value="TRANSFER">Virement</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Membre (téléphone, facultatif)</label>
        <input name="memberPhone" list="members" className="field" placeholder="Pour une dîme nominative" defaultValue={kept(state, "memberPhone")} />
        <datalist id="members">
          {members.map((m) => <option key={m.phone} value={m.phone}>{m.name}</option>)}
        </datalist>
        <FieldError state={state} name="memberPhone" />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Donateur (si non membre, facultatif)</label>
        <input name="donorName" className="field" defaultValue={kept(state, "donorName")} />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Note</label>
        <input name="note" className="field" placeholder="Ex. : quête du culte de dimanche" defaultValue={kept(state, "note")} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <SubmitButton>Enregistrer</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
