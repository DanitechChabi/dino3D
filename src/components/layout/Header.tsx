"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X, UserRound, HandHeart } from "lucide-react";
import { nav, church } from "@/content/site";
import { LogoMark } from "./Logo";

export function Header({ user }: { user: { firstName: string; isStaff: boolean } | null }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 80);
    setHidden(y > 300 && y > prev && !open);
  });

  // Referme le menu mobile à chaque changement de page
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Texte clair sur le ciel nocturne du haut de page et sur le menu mobile ouvert
  const light = !solid || open;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid && !open ? "border-b border-night-900/5 bg-ivory/80 shadow-sm backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className={`whitespace-nowrap leading-tight transition-colors ${light ? "text-white" : "text-night-900"}`}>
              <span className="block font-serif text-lg font-semibold">Jésus Revient</span>
              <span className={`block text-[0.6rem] font-bold uppercase tracking-[0.2em] ${light ? "text-gold-200" : "text-gold-600"}`}>
                EBB · {church.city}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Navigation principale">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                    light ? "text-white/85 hover:text-white" : "text-night-800 hover:text-night-950"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full ${light ? "bg-white/15" : "bg-gold-300/40"}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/donner"
              className="hidden items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 px-4 py-2 text-sm font-bold text-night-950 shadow-[0_6px_20px_-8px_rgba(212,164,60,.9)] transition hover:brightness-105 sm:inline-flex"
            >
              <HandHeart className="size-4" /> Donner
            </Link>
            <Link
              href={user ? (user.isStaff ? "/admin" : "/espace-membre") : "/connexion"}
              className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition sm:inline-flex ${
                light ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" : "bg-night-900 text-gold-200 hover:bg-night-800"
              }`}
            >
              <UserRound className="size-4" />
              {user ? user.firstName : "Espace membre"}
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              className={`grid size-11 place-items-center rounded-full xl:hidden ${light ? "text-white" : "text-night-900"} ${open ? "text-white" : ""}`}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-night-950 px-6 pb-10 pt-24 xl:hidden"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 size-[120vw] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" />
            <motion.ul
              className="relative space-y-1"
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.06, delayChildren: 0.25 }}
            >
              {[...nav, { href: "/donner", label: "Faire un don" }, { href: user ? "/espace-membre" : "/connexion", label: user ? "Mon espace" : "Espace membre" }].map((item) => (
                <motion.li
                  key={item.href + item.label}
                  variants={{ hidden: { opacity: 0, x: -30, filter: "blur(6px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)" } }}
                >
                  <Link href={item.href} className="block py-2 font-serif text-4xl font-medium text-white/90 hover:text-gold-200">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
