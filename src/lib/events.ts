import { z } from "zod";

export const programSchema = z.array(z.object({ time: z.string().max(20), title: z.string().min(1).max(200) })).max(40);
export type ProgramItem = z.infer<typeof programSchema>[number];

export function parseProgram(value: unknown): ProgramItem[] {
  const parsed = programSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

/** Programme saisi dans l'administration, une ligne par élément : « 09:00 Accueil et louange ». */
export function programFromText(text: string): ProgramItem[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d{1,2}[:h]\d{2})\s*[-–:]?\s*(.+)$/i);
      return m ? { time: m[1].replace("h", ":").padStart(5, "0"), title: m[2] } : { time: "", title: line };
    });
}

export function programToText(items: ProgramItem[]) {
  return items.map((i) => (i.time ? `${i.time} ${i.title}` : i.title)).join("\n");
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const EVENT_CATEGORIES = ["Culte spécial", "Conférence", "Convention", "Formation", "Jeunesse", "Femmes", "Hommes", "Enfants", "Évangélisation", "Baptême", "Mariage", "Veillée", "Retraite", "Autre"];
