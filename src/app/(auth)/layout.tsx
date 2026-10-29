import Link from "next/link";
import { LightParticles } from "@/components/motion/LightParticles";
import { AnimatedLogo } from "@/components/motion/AnimatedLogo";
import { LogoMark } from "@/components/layout/Logo";
import { church } from "@/content/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-night-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,#22326b_0%,#070d24_60%,#04081a_100%)]" />
        <div className="absolute left-1/2 top-[40%] size-[120vmax] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_0%,transparent_45%)]">
          <div className="size-full animate-rays bg-[repeating-conic-gradient(from_0deg,rgba(255,240,200,.14)_0deg_3deg,transparent_3deg_14deg)]" />
        </div>
        <LightParticles density={60} />
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-center">
          <AnimatedLogo className="size-64" delay={0.2} priority />
          <p className="mt-10 max-w-md font-serif text-3xl italic leading-snug text-white">
            « Voici, je me tiens à la porte, et je frappe. »
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Apocalypse 3:20</p>
        </div>
      </aside>
      <main className="flex flex-col bg-ivory px-4 py-8 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 self-start">
          <LogoMark />
          <span className="font-serif text-lg font-semibold text-night-900">{church.shortName}</span>
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
