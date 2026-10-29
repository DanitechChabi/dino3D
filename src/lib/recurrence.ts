// Récurrence des cultes : chaque semaine, ou certaines semaines du mois (ex. 1er et 3e dimanches).

export const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const ORDINALS = ["", "1er", "2e", "3e", "4e", "5e"];

/** Rang de la semaine dans le mois pour un jour du mois (1 à 7 → 1, 8 à 14 → 2…). */
export function weekOfMonth(dayOfMonth: number) {
  return Math.ceil(dayOfMonth / 7);
}

export function occursInWeek(weeks: number[], dayOfMonth: number) {
  return weeks.length === 0 || weeks.includes(weekOfMonth(dayOfMonth));
}

/** « Chaque dimanche », « 1er dimanche du mois », « 1er et 3e dimanches du mois »… */
export function recurrenceLabel(dayOfWeek: number, weeks: number[]) {
  const day = DAY_NAMES[dayOfWeek];
  if (weeks.length === 0) return `Chaque ${day}`;
  const sorted = [...weeks].sort();
  const ords = sorted.map((w) => ORDINALS[w]);
  const list = ords.length === 1 ? ords[0] : `${ords.slice(0, -1).join(", ")} et ${ords.at(-1)}`;
  return `${list.charAt(0).toUpperCase()}${list.slice(1)} ${day}${sorted.length > 1 ? "s" : ""} du mois`;
}
