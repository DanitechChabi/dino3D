import Image from "next/image";

/** Logo officiel EBB‑JR (sceau circulaire). */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 rounded-full bg-white shadow-[0_0_0_1px_rgba(241,216,143,.35),0_4px_14px_-4px_rgba(0,0,0,.4)] ${className}`}>
      <Image src="/brand/logo-ebb-jr-192.png" alt="Logo EBB‑JR" fill sizes="64px" className="rounded-full object-contain" />
    </span>
  );
}
