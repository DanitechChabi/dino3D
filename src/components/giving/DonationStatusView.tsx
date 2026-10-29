"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Receipt, RotateCcw, XCircle } from "lucide-react";
import { checkDonation } from "@/actions/giving";

type Status = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

function Burst() {
  // Éclats dorés autour de la coche
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-2 rounded-full bg-gold-300"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.round(Math.cos(a) * 110), y: Math.round(Math.sin(a) * 110), opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/** Suit l'état du paiement jusqu'à sa confirmation, puis célèbre le don. */
export function DonationStatusView({ reference, initial, message }: { reference: string; initial: Status; message?: string }) {
  const [status, setStatus] = useState<Status>(initial);

  useEffect(() => {
    if (status !== "PENDING") return;
    let tries = 0;
    const id = setInterval(async () => {
      tries++;
      const s = await checkDonation(reference);
      if (s && s !== "PENDING") setStatus(s);
      if (tries > 60) clearInterval(id); // ~3 minutes
    }, 3000);
    return () => clearInterval(id);
  }, [status, reference]);

  if (status === "PENDING")
    return (
      <div className="text-center">
        <Loader2 className="mx-auto size-14 animate-spin text-gold-400" />
        <h1 className="mt-6 font-serif text-4xl font-semibold text-white">Paiement en cours…</h1>
        <p className="mt-3 text-white/70">{message ?? "Validez le paiement sur votre téléphone si cela vous est demandé. Cette page se met à jour toute seule."}</p>
      </div>
    );

  if (status === "SUCCEEDED")
    return (
      <div className="text-center">
        <div className="relative mx-auto size-28">
          <Burst />
          <motion.svg viewBox="0 0 100 100" className="size-28" initial="hidden" animate="show">
            <motion.circle cx="50" cy="50" r="44" fill="none" stroke="#e4bd5f" strokeWidth="5" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.7 } } }} />
            <motion.path d="M30 52 L45 66 L71 37" fill="none" stroke="#f8e7b5" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.6 } } }} />
          </motion.svg>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6 font-serif text-4xl font-semibold text-white sm:text-5xl">
          Merci pour votre don !
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mx-auto mt-4 max-w-md font-serif text-xl italic text-white/80">
          « Dieu aime celui qui donne avec joie. » <span className="not-italic text-gold-300">— 2 Corinthiens 9:7</span>
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`/recu/${reference}`} target="_blank" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 px-6 py-3 font-bold text-night-950">
            <Receipt className="size-4" /> Mon reçu
          </a>
          <Link href="/" className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10">Retour à l&apos;accueil</Link>
        </motion.div>
      </div>
    );

  return (
    <div className="text-center">
      <XCircle className="mx-auto size-16 text-red-400" />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-white">{status === "CANCELLED" ? "Paiement annulé" : "Le paiement n'a pas abouti"}</h1>
      <p className="mt-3 text-white/70">Aucun montant n&apos;a été prélevé. Vous pouvez réessayer.</p>
      <Link href="/donner" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 px-6 py-3 font-bold text-night-950">
        <RotateCcw className="size-4" /> Réessayer
      </Link>
    </div>
  );
}
