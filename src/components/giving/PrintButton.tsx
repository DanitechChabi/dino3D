"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-night-950 px-5 py-2.5 text-sm font-bold text-gold-200">
      <Printer className="size-4" /> Imprimer / enregistrer en PDF
    </button>
  );
}
