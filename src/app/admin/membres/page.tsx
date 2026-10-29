import type { Metadata } from "next";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, ROLE_LABELS } from "@/lib/dal";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { MemberRow } from "@/components/admin/MemberRow";

export const metadata: Metadata = { title: "Membres" };

export default async function MembersAdmin(props: PageProps<"/admin/membres">) {
  const me = await requireRole("ADMIN");
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const users = await db.user.findMany({
    where: query
      ? { OR: [{ firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }, { phone: { contains: query } }] }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { ministries: { include: { ministry: { select: { name: true } } } } },
  });

  return (
    <>
      <AdminTitle title="Membres" text={`${users.length} compte${users.length > 1 ? "s" : ""}`}>
        <form className="w-full sm:w-72">
          <input name="q" defaultValue={query} placeholder="Rechercher (nom, téléphone)…" className="field" />
        </form>
      </AdminTitle>
      <Panel className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-night-900/10 text-xs uppercase tracking-wider text-night-800/60">
            <tr>
              <th className="p-4">Membre</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Ministères</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Mot de passe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-night-900/5">
            {users.map((u) => (
              <MemberRow
                key={u.id}
                isSelf={u.id === me.id}
                roles={Object.values(Role).map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                user={{
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  phone: u.phone,
                  since: u.createdAt.toLocaleDateString("fr-FR"),
                  role: u.role,
                  active: u.active,
                  ministries: u.ministries.map((m) => m.ministry.name).join(", "),
                }}
              />
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
