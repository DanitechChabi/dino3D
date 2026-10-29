import Link from "next/link";
import { MapPin, Phone, Mail, Headset } from "lucide-react";
import { YoutubeIcon } from "@/components/YoutubeIcon";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { church, nav, DAYS } from "@/content/site";
import { db } from "@/lib/db";
import { AnimatedLogo } from "../motion/AnimatedLogo";

export async function Footer() {
  const services = await db.service.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }], take: 5 });

  return (
    <footer className="relative overflow-hidden bg-night-950 text-white/75">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[80vw] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <AnimatedLogo className="size-32" />
          <p className="mt-5 font-serif text-xl font-semibold leading-tight text-white">{church.name}</p>
          <p className="mt-4 text-sm leading-relaxed">« Oui, je viens bientôt. Amen ! Viens, Seigneur Jésus ! » <br />— Apocalypse 22:20</p>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Navigation</h3>
          <ul className="space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-gold-200">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Nos rendez-vous</h3>
          <ul className="space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <span className="text-white">{s.name}</span> — {DAYS[s.dayOfWeek]} {s.startTime.replace(":", "h")}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="size-4 shrink-0 text-gold-400" />{church.address}</li>
            <li>
              <a href={`tel:${church.phone.replace(/\s/g, "")}`} className="flex gap-2 hover:text-gold-200"><Phone className="size-4 shrink-0 text-gold-400" />{church.phone}</a>
            </li>
            <li>
              <a href={`tel:${church.assistancePhone.replace(/\s/g, "")}`} className="flex gap-2 hover:text-gold-200"><Headset className="size-4 shrink-0 text-gold-400" />Assistance : {church.assistancePhone}</a>
            </li>
            <li>
              <a href={`mailto:${church.email}`} className="flex gap-2 hover:text-gold-200"><Mail className="size-4 shrink-0 text-gold-400" />{church.email}</a>
            </li>
            {church.socials.whatsappChannel && (
              <li>
                <a href={church.socials.whatsappChannel} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-gold-200"><WhatsappIcon className="size-4 shrink-0 text-gold-400" />Chaîne WhatsApp EBB‑JR</a>
              </li>
            )}
            {church.socials.youtube && (
              <li>
                <a href={church.socials.youtube} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-gold-200"><YoutubeIcon className="size-4 shrink-0 text-gold-400" />Chaîne YouTube</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {church.name} — {church.city}. Soli Deo Gloria.
      </div>
    </footer>
  );
}
