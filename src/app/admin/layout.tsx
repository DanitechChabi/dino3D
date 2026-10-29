import Link from "next/link";
import { requireRole, ROLE_LABELS } from "@/lib/dal";
import { logout } from "@/actions/auth";
import { LogoMark } from "@/components/layout/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogOut, ExternalLink } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("RESPONSABLE");
  return (
    <div className="min-h-svh bg-parchment lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="relative overflow-hidden bg-night-950 text-white lg:sticky lg:top-0 lg:h-svh">
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative flex h-full flex-col gap-6 p-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark />
            <span>
              <span className="block font-serif text-lg font-semibold leading-tight">Administration</span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-300">EBB Jésus Revient</span>
            </span>
          </Link>
          <AdminNav isAdmin={user.role === "ADMIN"} />
          <div className="mt-auto hidden space-y-3 border-t border-white/10 pt-4 lg:block">
            <p className="text-sm">
              <span className="block font-semibold">{user.firstName} {user.lastName}</span>
              <span className="text-xs text-gold-300">{ROLE_LABELS[user.role]}</span>
            </p>
            <Link href="/" className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ExternalLink className="size-4" /> Voir le site</Link>
            <form action={logout}>
              <button className="flex items-center gap-2 text-sm text-white/70 hover:text-red-300"><LogOut className="size-4" /> Déconnexion</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
