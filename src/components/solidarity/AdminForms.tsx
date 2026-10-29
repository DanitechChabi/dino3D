"use client";

import { useActionState, useEffect, useRef } from "react";
import { closeCase, recordPayout, rejectCase, reviewCase } from "@/actions/solidarity";
import { FieldError, FormMessage, SubmitButton, formKey, kept, keptCheck } from "../forms/ui";

type CaseValues = {
  id: string;
  status: string;
  title: string;
  beneficiaryName: string;
  reason: string;
  story: string;
  goal: string;
  deadline: string;
  visibility: string;
};

export function ReviewForm({ c, reasons }: { c: CaseValues; reasons: string[] }) {
  const [state, action] = useActionState(reviewCase, undefined);
  const proposed = c.status === "PROPOSED";
  return (
    <form key={formKey(state)} action={action} className="grid gap-4 sm:grid-cols-6">
      <input type="hidden" name="id" value={c.id} />
      <div className="sm:col-span-6">
        <label className="label">Titre public</label>
        <input name="title" className="field" defaultValue={kept(state, "title", c.title)} />
        <FieldError state={state} name="title" />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Bénéficiaire</label>
        <input name="beneficiaryName" className="field" defaultValue={kept(state, "beneficiaryName", c.beneficiaryName)} />
      </div>
      <div className="sm:col-span-3">
        <label className="label">Motif</label>
        <select name="reason" className="field" defaultValue={kept(state, "reason", c.reason)}>
          {reasons.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div className="sm:col-span-6">
        <label className="label">Texte publié (relisez et retirez tout détail trop personnel)</label>
        <textarea name="story" rows={6} className="field resize-y" defaultValue={kept(state, "story", c.story)} />
        <FieldError state={state} name="story" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Objectif (F CFA)</label>
        <input name="goal" type="number" min={1000} className="field" placeholder="Sans objectif" defaultValue={kept(state, "goal", c.goal)} />
        <FieldError state={state} name="goal" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Date limite</label>
        <input name="deadline" type="date" className="field" defaultValue={kept(state, "deadline", c.deadline)} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Discrétion</label>
        <select name="visibility" className="field" defaultValue={kept(state, "visibility", c.visibility)}>
          <option value="ANONYMOUS">Bénéficiaire anonyme</option>
          <option value="MEMBERS">Réservée aux membres</option>
          <option value="PUBLIC">Publique</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        {proposed ? (
          <>
            <SubmitButton>Valider et publier</SubmitButton>
            <input type="hidden" name="decision" value="publier" />
          </>
        ) : (
          <>
            <SubmitButton>Enregistrer</SubmitButton>
            <input type="hidden" name="decision" value="enregistrer" />
          </>
        )}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function RejectForm({ id }: { id: string }) {
  return (
    <form action={rejectCase.bind(null, id)} onSubmit={(e) => !confirm("Classer cette demande sans suite ?") && e.preventDefault()}>
      <button className="text-sm font-semibold text-red-700 hover:underline">Classer sans suite</button>
    </form>
  );
}

export function PayoutForm({ caseId, today }: { caseId: string; today: string }) {
  const [state, action] = useActionState(recordPayout, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <label className="label">Montant remis</label>
        <input name="amount" type="number" min={1} className="field" defaultValue={kept(state, "amount")} />
        <FieldError state={state} name="amount" />
      </div>
      <div>
        <label className="label">Date</label>
        <input name="paidAt" type="date" className="field" defaultValue={kept(state, "paidAt", today)} />
      </div>
      <div>
        <label className="label">Note</label>
        <input name="note" className="field" placeholder="Ex. : remis en main propre par le diacre" defaultValue={kept(state, "note")} />
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
      <div className="sm:col-span-4"><FormMessage state={state} /></div>
    </form>
  );
}

export function CloseForm({ id }: { id: string }) {
  const [state, action] = useActionState(closeCase, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label">Message de remerciement (publié sur la page de la collecte)</label>
        <textarea name="thanksMessage" rows={3} className="field resize-y" placeholder="La famille remercie chaleureusement tous les frères et sœurs…" defaultValue={kept(state, "thanksMessage")} />
      </div>
      <label className="flex items-center gap-2 text-sm text-night-800">
        <input type="checkbox" name="notify" defaultChecked={keptCheck(state, "notify", true)} className="size-4 accent-gold-500" /> Envoyer une notification de remerciement aux abonnés
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Clôturer la collecte</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
