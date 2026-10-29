"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import type { Role } from "@prisma/client";
import { resetUserPassword, setUserActive, setUserRole } from "@/actions/admin";

type Props = {
  isSelf: boolean;
  roles: { value: Role; label: string }[];
  user: { id: string; name: string; phone: string; since: string; role: Role; active: boolean; ministries: string };
};

export function MemberRow({ user, roles, isSelf }: Props) {
  const [pending, start] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);
  return (
    <tr className={`${pending ? "opacity-50" : ""} ${user.active ? "" : "bg-night-900/[0.03] text-night-800/50"}`}>
      <td className="p-4">
        <p className="font-semibold text-night-900">{user.name}{isSelf && " (vous)"}</p>
        <p className="text-xs text-night-800/50">Inscrit le {user.since}</p>
      </td>
      <td className="p-4 tabular-nums">{user.phone}</td>
      <td className="p-4 text-night-800/70">{user.ministries || "—"}</td>
      <td className="p-4">
        <select
          value={user.role}
          disabled={isSelf || pending}
          onChange={(e) => start(() => setUserRole(user.id, e.target.value as Role))}
          className="rounded-lg border border-night-900/15 bg-white px-2 py-1.5 text-sm disabled:opacity-60"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </td>
      <td className="p-4">
        <button
          disabled={isSelf || pending}
          onClick={() => start(() => setUserActive(user.id, !user.active))}
          className={`rounded-full px-3 py-1 text-xs font-bold disabled:opacity-60 ${user.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
        >
          {user.active ? "Actif" : "Désactivé"}
        </button>
      </td>
      <td className="p-4">
        {temp ? (
          <span className="block rounded-lg bg-gold-300/30 px-2 py-1 text-xs">
            Mot de passe temporaire : <strong className="font-mono text-sm text-night-950">{temp}</strong>
            <span className="block text-night-800/60">À transmettre au membre (affiché une seule fois)</span>
          </span>
        ) : (
          <button
            disabled={isSelf || pending}
            onClick={() => confirm(`Réinitialiser le mot de passe de ${user.name} ?`) && start(async () => setTemp(await resetUserPassword(user.id)))}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-night-800 hover:bg-night-900/5 disabled:opacity-40"
          >
            <KeyRound className="size-3.5" /> Réinitialiser
          </button>
        )}
      </td>
    </tr>
  );
}
