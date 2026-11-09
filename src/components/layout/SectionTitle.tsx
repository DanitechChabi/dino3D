import { Reveal } from "../motion/Reveal";

export function SectionTitle({ eyebrow, title, text, dark = false, center = false }: { eyebrow: string; title: string; text?: string; dark?: boolean; center?: boolean }) {
  return (
    <Reveal className={`mb-10 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className={`text-sm font-semibold ${dark ? "text-gold-400" : "text-gold-600"}`}>{eyebrow}</p>
      <h2 className={`mt-1 font-serif text-4xl font-semibold leading-tight sm:text-[2.75rem] ${dark ? "text-white" : "text-night-900"}`}>{title}</h2>
      {text && <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-white/70" : "text-night-800/75"}`}>{text}</p>}
    </Reveal>
  );
}
