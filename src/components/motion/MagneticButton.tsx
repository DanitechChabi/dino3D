import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  gold: "bg-gold-500 text-night-950 hover:bg-gold-400",
  dark: "bg-night-900 text-white hover:bg-night-800",
  ghost: "border border-white/40 text-white hover:bg-white/10",
  ghostDark: "border border-night-900/25 text-night-900 hover:bg-night-900/5",
};

/** Bouton-lien du site. */
export function MagneticButton({
  href,
  children,
  variant = "gold",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
