"use client";

import { useTransition } from "react";
import { setMessageHandled } from "@/actions/admin";

export function HandledToggle({ id, handled }: { id: string; handled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => setMessageHandled(id, !handled))}
      className={`rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${handled ? "bg-night-900/5 text-night-800" : "bg-gold-300/50 text-night-900 hover:bg-gold-300"}`}
    >
      {handled ? "Marquer non traité" : "Marquer traité"}
    </button>
  );
}
