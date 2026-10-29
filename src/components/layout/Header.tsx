"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { UserRound, HandHeart, Radio, HeartHandshake, ArrowUpRight } from "lucide-react";
import { nav, church } from "@/content/site";
import { LogoMark } from "./Logo";

type SessionUser = { firstName: string; isStaff: boolean } | null;
const ease = [0.22, 1, 0.36, 1] as const;

/** Identité du visiteur, lue côté navigateur pour que les pages publiques restent statiques (donc rapides). */
function useSessionUser(pathname: string) {
  const [user, setUser] = useState<SessionUser>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/session", { cache: "no-store", signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { user: SessionUser }) => setUser(d.user))
      .catch(() => {});
    return () => ctrl.abort();
  }, [pathname]);
  return user;
}

/** Petit halo qui pulse sur le lien cliqué tant que la page se charge. */
function PendingGlow() {
  const { pending } = useLinkStatus();
  return (
    <AnimatePresence>
      {pending && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { repeat: Infinity, duration: 0.9 }, scale: { duration: 0.2 } }}
          className="absolute -right-0.5 top-1 size-1.5 rounded-full bg-gold-400"
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}

/** Bouton « hamburger » dont les traits se croisent en X. */
function MenuToggle({ open, light, onClick }: { open: boolean; light: boolean; onClick: () => void }) {
  const line = `absolute left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full ${light ? "bg-white" : "bg-night-900"}`;
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      aria-expanded={open}
      className={`relative size-11 rounded-full transition-colors xl:hidden ${light ? "hover:bg-white/10" : "hover:bg-night-900/5"}`}
    >
      <motion.span className={line} style={{ top: "50%" }} animate={open ? { y: 0, rotate: 45 } : { y: -7, rotate: 0 }} transition={{ duration: 0.35, ease }} />
      <motion.span className={line} style={{ top: "50%" }} animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.25 }} />
      <motion.span className={line} style={{ top: "50%" }} animate={open ? { y: 0, rotate: -45 } : { y: 7, rotate: 0 }} transition={{ duration: 0.35, ease }} />
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const user = useSessionUser(pathname);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 });
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const nextSolid = y > 60;
    // Se cache en descendant (après le haut de page), réapparaît dès qu'on remonte
    const nextHidden = y > 400 && y > prev + 2 ? true : y < prev - 2 ? false : hidden;
    if (nextSolid !== solid) setSolid(nextSolid);
    if (nextHidden !== hidden) setHidden(nextHidden);
  });

  // Referme le menu mobile à chaque changement de page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setHidden(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Texte clair sur le ciel nocturne du haut de page et sur le menu mobile ouvert
  const light = !solid || open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const accountHref = user ? (user.isStaff ? "/admin" : "/espace-membre") : "/connexion";
  const desktopNav = nav.filter((item) => item.href !== "/");
  const extras = [
    { href: "/direct", label: "En direct", icon: Radio },
    { href: "/solidarite", label: "Solidarité", icon: HeartHandshake },
    { href: "/donner", label: "Faire un don", icon: HandHeart },
    { href: accountHref, label: user ? "Mon espace" : "Espace membre", icon: UserRound },
  ];

  return (
    <>
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          solid && !open ? "border-b border-night-900/5 bg-ivory shadow-[0_8px_30px_-18px_rgba(4,8,26,.35)]" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-500 ${solid && !open ? "h-16" : "h-16 sm:h-20"}`}>
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Accueil — EBB Jésus Revient">
            <motion.span whileHover={{ rotate: -8, scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="inline-block">
              <LogoMark className={`transition-[width,height] duration-500 ${solid && !open ? "size-9" : "size-10"}`} />
            </motion.span>
            <span className={`whitespace-nowrap leading-tight transition-colors duration-500 ${light ? "text-white" : "text-night-900"}`}>
              <span className="block font-serif text-lg font-semibold">
                Jésus <span className={`italic transition-colors duration-500 ${light ? "text-gold-300" : "text-gold-600"}`}>Revient</span>
              </span>
              <span className={`block text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${light ? "text-gold-200" : "text-gold-600"}`}>
                EBB · {church.city}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center xl:flex" aria-label="Navigation principale" onMouseLeave={() => setHovered(null)}>
            {desktopNav.map((item, i) => {
              const active = isActive(item.href);
              return (
                <motion.div key={item.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease }}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`relative block whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                      light ? (active ? "text-white" : "text-white/75 hover:text-white") : active ? "text-night-950" : "text-night-800/80 hover:text-night-950"
                    }`}
                  >
                    {hovered === item.href && (
                      <motion.span
                        layoutId="nav-hover"
                        className={`absolute inset-0 rounded-full ${light ? "bg-white/12" : "bg-night-900/6"}`}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                    <PendingGlow />
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} className="hidden sm:block">
              <Link
                href="/donner"
                className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 px-4 py-2 text-sm font-bold text-night-950 shadow-[0_6px_20px_-8px_rgba(212,164,60,.9)]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-[sweep_3.5s_ease-in-out_infinite] bg-white/40" aria-hidden />
                <HandHeart className="relative size-4" /> <span className="relative">Donner</span>
              </Link>
            </motion.div>
            <Link
              href={accountHref}
              aria-label={user ? `Mon espace (${user.firstName})` : "Espace membre"}
              className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 sm:inline-flex ${
                light ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" : "bg-night-900 text-gold-200 hover:bg-night-800"
              }`}
            >
              <UserRound className="size-4" />
              {/* Sur écran moyen, l'icône seule laisse la place au menu */}
              <span className="whitespace-nowrap xl:hidden 2xl:inline">{user ? user.firstName : "Espace membre"}</span>
            </Link>
            <MenuToggle open={open} light={light} onClick={() => setOpen((o) => !o)} />
          </div>
        </div>

        {/* Fil doré : progression de la lecture */}
        <motion.div
          style={{ scaleX: progress }}
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 transition-opacity duration-500 ${solid && !open ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: "-4%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-3%", transition: { duration: 0.25, ease } }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-0 z-40 overflow-y-auto bg-night-950 xl:hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(212,164,60,.16),transparent_70%)]" />
            <nav aria-label="Menu" className="relative mx-auto flex min-h-full max-w-lg flex-col px-6 pb-10 pt-24">
              <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}>
                {nav.map((item, i) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li key={item.href} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center gap-4 border-b border-white/8 py-3 font-serif text-[1.9rem] leading-tight transition-colors ${active ? "text-gold-200" : "text-white/90 hover:text-white"}`}
                      >
                        <span className="w-6 font-sans text-xs font-bold tabular-nums text-gold-400/70">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1 transition-transform duration-300 group-hover:translate-x-1.5">{item.label}</span>
                        {active ? <span className="size-2 rounded-full bg-gold-400 shadow-[0_0_12px_rgba(241,216,143,.9)]" /> : <ArrowUpRight className="size-5 text-white/25 transition group-hover:text-gold-300" />}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <motion.div
                className="mt-8 grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35, ease }}
              >
                {extras.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold transition active:scale-[.97] ${
                      href === "/donner" ? "bg-gradient-to-br from-gold-300 to-gold-500 text-night-950" : "bg-white/8 text-white ring-1 ring-white/10 hover:bg-white/12"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" /> {label}
                  </Link>
                ))}
              </motion.div>
              <p className="mt-auto pt-10 text-center font-serif text-sm italic text-white/45">« Oui, je viens bientôt. » — Apocalypse 22:20</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
