import { SplitWords } from "../motion/SplitWords";
import { Reveal } from "../motion/Reveal";

export function SectionTitle({ eyebrow, title, text, dark = false, center = false }: { eyebrow: string; title: string; text?: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className={`text-xs font-bold uppercase tracking-[0.3em] ${dark ? "text-gold-400" : "text-gold-600"}`}>{eyebrow}</p>
      </Reveal>
      <SplitWords text={title} className={`mt-2 font-serif text-4xl font-semibold leading-tight sm:text-5xl ${dark ? "text-white" : "text-night-900"}`} />
      {text && (
        <Reveal delay={0.2}>
          <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-white/70" : "text-night-800/70"}`}>{text}</p>
        </Reveal>
      )}
    </div>
  );
}
