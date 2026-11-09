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
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105 ${className}`}
    >
      <WhatsappIcon className="size-5" />
      Suivre la chaîne WhatsApp
    </a>
  );
}
