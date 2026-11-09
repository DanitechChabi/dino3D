import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/layout/Logo";
import { church } from "@/content/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-night-950 lg:block">
        <Image src="/galerie/conference-couple-2026/conference-02.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/60 to-night-950/30" />
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-center">
          <LogoMark className="size-28" />
          <p className="mt-10 max-w-md font-serif text-3xl italic leading-snug text-white">
            « Voici, je me tiens à la porte, et je frappe. »
          </p>
          <p className="mt-3 text-sm font-semibold text-gold-400">Apocalypse 3:20</p>
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
