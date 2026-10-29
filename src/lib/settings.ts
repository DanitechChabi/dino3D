import "server-only";
import { cache } from "react";
import { db } from "./db";
import { church } from "@/content/site";

/** Coordonnées modifiables depuis l'administration ; à défaut, les valeurs de src/content/site.ts. */
export const SETTING_KEYS = ["address", "mapQuery", "whatsapp", "facebook", "youtube", "whatsappChannel"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type ChurchSettings = Record<SettingKey, string>;

export const SETTING_DEFAULTS: ChurchSettings = {
  address: church.address,
  mapQuery: "",
  whatsapp: church.whatsapp,
  facebook: church.socials.facebook,
  youtube: church.socials.youtube,
  whatsappChannel: church.socials.whatsappChannel,
};

export const getSettings = cache(async (): Promise<ChurchSettings> => {
  const rows = await db.setting.findMany({ where: { key: { in: [...SETTING_KEYS] } } });
  const saved = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...SETTING_DEFAULTS, ...saved };
});

/** Carte Google Maps intégrable sans clé d'API, à partir de coordonnées GPS ou d'un nom de lieu. */
export function mapEmbed(s: ChurchSettings) {
  return s.mapQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&z=16&output=embed` : null;
}

export function mapDirections(s: ChurchSettings) {
  return s.mapQuery ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery)}` : null;
}
