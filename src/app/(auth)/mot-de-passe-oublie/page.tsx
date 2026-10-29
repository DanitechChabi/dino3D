import type { Metadata } from "next";
import Link from "next/link";
import { Headset, Phone } from "lucide-react";
import { church } from "@/content/site";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-4xl font-semibold text-night-900">Mot de passe oublié ?</h1>
      <p className="text-night-800/70">
        Pas d&apos;inquiétude. Contactez l&apos;église : le pasteur ou l&apos;administrateur vous donnera un mot de passe temporaire,
        et vous en choisirez un nouveau à votre prochaine connexion.
      </p>
      <div className="space-y-3">
        <a href={tel(church.assistancePhone)} className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white p-4 hover:border-gold-400">
          <Headset className="size-5 text-gold-600" />
          <span><span className="block text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Assistance</span><span className="font-semibold text-night-900">{church.assistancePhone}</span></span>
        </a>
        <a href={tel(church.phone)} className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white p-4 hover:border-gold-400">
          <Phone className="size-5 text-gold-600" />
          <span><span className="block text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Église</span><span className="font-semibold text-night-900">{church.phone}</span></span>
        </a>
      </div>
      <Link href="/connexion" className="inline-block text-sm font-bold text-gold-600">← Retour à la connexion</Link>
    </div>
  );
}
