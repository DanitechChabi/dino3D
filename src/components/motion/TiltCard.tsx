import type { ReactNode } from "react";

/** Carte simple : légère élévation au survol. */
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`group relative overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(7,13,36,.45)] ${className}`}>{children}</div>;
}
