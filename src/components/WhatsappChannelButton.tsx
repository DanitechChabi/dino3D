import { getSettings } from "@/lib/settings";
import { WhatsappIcon } from "./WhatsappIcon";

/** Bouton « Suivre la chaîne EBB‑JR sur WhatsApp ». */
export async function WhatsappChannelButton({ className = "" }: { className?: string }) {
  const { whatsappChannel } = await getSettings();
  if (!whatsappChannel) return null;
  return (
    <a
      href={whatsappChannel}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,.8)] transition hover:brightness-105 active:scale-[.98] ${className}`}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s]" aria-hidden />
      <WhatsappIcon className="relative size-5" />
      <span className="relative">Suivre la chaîne EBB‑JR sur WhatsApp</span>
    </a>
  );
}
