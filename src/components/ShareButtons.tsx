"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";

/** Partage d'un article : WhatsApp et copie du lien. */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-[0.2em] text-night-800/60">Partager</span>
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url()}`)}`, "_blank", "noopener")}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:brightness-105"
      >
        <MessageCircle className="size-4" /> WhatsApp
      </button>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-night-900/15 bg-white px-4 py-2 text-sm font-bold text-night-900 hover:border-gold-400"
      >
        {copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
    </div>
  );
}
