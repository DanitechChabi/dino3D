import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle, Headset } from "lucide-react";
import { YoutubeIcon } from "@/components/YoutubeIcon";
import { WhatsappChannelButton } from "@/components/WhatsappChannelButton";
import { church } from "@/content/site";
import { getSettings, mapDirections, mapEmbed } from "@/lib/settings";
import { FacebookIcon } from "@/components/FacebookIcon";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Contact & prière" };

export default async function ContactPage(props: PageProps<"/contact">) {
  const sp = await props.searchParams;
  const prayer = sp.priere === "1";
  const subject = typeof sp.sujet === "string" ? sp.sujet.slice(0, 150) : undefined;

  const settings = await getSettings();
  const embed = mapEmbed(settings);
  const directions = mapDirections(settings);
  const infos = [
    { icon: MapPin, label: "Adresse", value: settings.address, href: directions ?? undefined },
    { icon: Phone, label: "Téléphone", value: church.phone, href: `tel:${church.phone.replace(/\s/g, "")}` },
    { icon: Headset, label: "Assistance", value: church.assistancePhone, href: `tel:${church.assistancePhone.replace(/\s/g, "")}` },
    { icon: Mail, label: "E-mail", value: church.email, href: `mailto:${church.email}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow={prayer ? "Demande de prière" : "Contact"}
        title={prayer ? "Nous prions avec vous" : "Parlons ensemble"}
        subtitle={prayer ? "« La prière fervente du juste a une grande efficacité. » — Jacques 5:16" : "Une question, une visite, un besoin ? Écrivez-nous."}
      />
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="space-y-4">
            {infos.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 rounded-3xl border border-night-900/10 bg-white p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-night-950 text-gold-300"><Icon className="size-5" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{label}</p>
                  {href ? <a href={href} className="font-semibold text-night-900 hover:text-gold-600">{value}</a> : <p className="font-semibold text-night-900">{value}</p>}
                </div>
              </div>
            ))}
            <WhatsappChannelButton className="w-full" />
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF0000] px-6 py-3 font-bold text-white transition hover:brightness-110"
              >
                <YoutubeIcon className="size-5" /> Notre chaîne YouTube
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1877F2] px-6 py-3 font-bold text-white transition hover:brightness-110"
              >
                <FacebookIcon className="size-5" /> Notre page Facebook
              </a>
            )}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white transition hover:brightness-105"
              >
                <MessageCircle className="size-5" /> Écrire sur WhatsApp
              </a>
            )}
            <div className="overflow-hidden rounded-3xl border border-night-900/10 bg-night-950">
              {embed ? (
                <>
                  <iframe src={embed} title="Carte de localisation de l'église" className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  <a href={directions!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-gold-200 hover:text-white">
                    <MapPin className="size-4" /> Itinéraire jusqu&apos;à l&apos;église
                  </a>
                </>
              ) : (
                <div className="grid h-64 place-items-center p-6 text-center text-sm text-white/60">
                  <div>
                    <MapPin className="mx-auto mb-2 size-8 text-gold-400" />
                    La carte de localisation sera ajoutée dès que l&apos;adresse exacte sera fournie.
                  </div>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm prayer={prayer} subject={subject} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
