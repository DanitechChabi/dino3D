"use client";

import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { FormState } from "@/lib/validation";

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 px-6 py-3 text-sm font-bold text-night-950 shadow-[0_10px_30px_-10px_rgba(212,164,60,.8)] transition hover:brightness-105 active:scale-[.98] disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const msg = state?.errors?.[name]?.[0];
  return (
    <AnimatePresence>
      {msg && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 text-sm text-red-600">
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.message) return null;
  const Icon = state.ok ? CheckCircle2 : AlertCircle;
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      role="status"
      className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      {state.message}
    </motion.p>
  );
}

/** Valeur à réafficher après une erreur, sinon la valeur initiale. */
export function kept(state: FormState, name: string, fallback?: string | number | null) {
  return state?.values?.[name] ?? fallback ?? undefined;
}

/** Case à cocher : état saisi après une erreur, sinon l'état initial. */
export function keptCheck(state: FormState, name: string, fallback?: boolean) {
  return state?.values ? state.values[name] === "on" : fallback;
}
