"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, Users, CalendarClock, Megaphone, Mail } from "lucide-react";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/annonces", label: "Annonces", icon: Megaphone },
  { href: "/admin/messages", label: "Messages & prières", icon: Mail },
  { href: "/admin/membres", label: "Membres", icon: Users, adminOnly: true },
  { href: "/admin/cultes", label: "Cultes & horaires", icon: CalendarClock, adminOnly: true },
];

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible">
      {items
        .filter((i) => isAdmin || !i.adminOnly)
        .map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "text-night-950" : "text-white/75 hover:text-white"}`}>
              {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-300 to-gold-500" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <Icon className="relative size-4" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
    </nav>
  );
}
