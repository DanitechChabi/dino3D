import { church } from "@/content/site";
import { occursInWeek } from "./recurrence";

const TZ = church.timeZone;

/** Construit une date à partir d'un jour et d'une heure exprimés à l'heure de l'église. */
export function churchDateTime(day: string, time: string) {
  return new Date(`${day}T${time}:00${church.utcOffset}`);
}

/** Valeur d'un champ <input type="datetime-local"> interprétée à l'heure de l'église. */
export function fromLocalInput(value: string) {
  return new Date(`${value}:00${church.utcOffset}`);
}

/** Composantes (année, mois, jour, heure, jour de la semaine) d'une date à l'heure de l'église. */
export function churchParts(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`, weekday };
}

/** Pour pré-remplir un <input type="datetime-local">. */
export function toLocalInput(date: Date) {
  const p = churchParts(date);
  return `${p.day}T${p.time}`;
}

export function formatDay(date: Date, withYear = true) {
  const text = date.toLocaleDateString("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).replace(":", "h");
}

/** Ajoute n jours à une date « AAAA-MM-JJ ». */
export function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type WeeklySlot = { id: string; name: string; dayOfWeek: number; weeks: number[]; startTime: string; endTime: string | null; location: string; description: string | null };

/** Occurrences des cultes (hebdomadaires ou certaines semaines du mois) entre `from` et `from + days`. */
export function serviceOccurrences<T extends WeeklySlot>(services: T[], from: Date, days: number) {
  const start = churchParts(from).day;
  const out: { service: T; startAt: Date; endAt: Date | null; day: string }[] = [];
  for (let i = 0; i <= days; i++) {
    const day = addDays(start, i);
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    for (const s of services) {
      if (s.dayOfWeek !== weekday || !occursInWeek(s.weeks, Number(day.slice(8)))) continue;
      const startAt = churchDateTime(day, s.startTime);
      if (startAt < from) continue;
      out.push({ service: s, startAt, endAt: s.endTime ? churchDateTime(day, s.endTime) : null, day });
    }
  }
  return out.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
