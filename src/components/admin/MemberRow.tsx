"use client";

import { useTransition } from "react";
import type { Role } from "@prisma/client";
import { setUserActive, setUserRole } from "@/actions/admin";

type Props = {
  isSelf: boolean;
  roles: { value: Role; label: string }[];
  user: { id: string; name: string; phone: string; since: string; role: Role; active: boolean; ministries: string };
};

export function MemberRow({ user, roles, isSelf }: Props) {
  const [pending, start] = useTransition();
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
    </tr>
  );
}
