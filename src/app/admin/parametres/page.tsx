import type { Metadata } from "next";
import { requireRole } from "@/lib/dal";
import { getSettings, mapEmbed } from "@/lib/settings";
import { AdminTitle, Panel } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsAdmin() {
  await requireRole("ADMIN");
  const settings = await getSettings();
  const embed = mapEmbed(settings);
  return (
    <>
      <AdminTitle title="Paramètres de l'église" text="Coordonnées affichées dans le pied de page et sur la page Contact." />
      <Panel className="mb-6">
        <SettingsForm values={settings} />
      </Panel>
      {embed && (
        <Panel>
          <h2 className="mb-4 font-serif text-2xl font-semibold text-night-900">Aperçu de la carte</h2>
          <iframe src={embed} title="Aperçu de la carte" className="h-72 w-full rounded-2xl" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Panel>
      )}
    </>
  );
}
