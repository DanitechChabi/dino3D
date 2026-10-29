import "server-only";
import { db } from "./db";
import { churchParts } from "./time";

/** Jour et mois (la date de naissance est enregistrée à minuit UTC). */
function monthDay(d: Date) {
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function today() {
  const [y, m, d] = churchParts(new Date()).day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Membres dont l'anniversaire tombe dans les `days` prochains jours (aujourd'hui compris). */
export async function upcomingBirthdays(days = 14) {
  const start = today();
  const users = await db.user.findMany({
    where: { active: true, birthDate: { not: null } },
    select: { id: true, firstName: true, lastName: true, phone: true, birthDate: true },
  });
  return users
    .map((u) => {
      const { month, day } = monthDay(u.birthDate!);
      let next = new Date(Date.UTC(start.getUTCFullYear(), month - 1, day));
      if (next < start) next = new Date(Date.UTC(start.getUTCFullYear() + 1, month - 1, day));
      const inDays = Math.round((next.getTime() - start.getTime()) / 86_400_000);
      return { ...u, inDays, next, age: next.getUTCFullYear() - u.birthDate!.getUTCFullYear() };
    })
    .filter((u) => u.inDays < days)
    .sort((a, b) => a.inDays - b.inDays);
}

export function isBirthdayToday(birthDate: Date | null) {
  if (!birthDate) return false;
  const t = monthDay(today());
  const b = monthDay(birthDate);
  return t.month === b.month && t.day === b.day;
}

/** Lien WhatsApp pré-rempli avec un message de vœux (numéros béninois à 10 chiffres complétés par 229). */
export function wishLink(phone: string, firstName: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = phone.startsWith("+") ? digits : digits.length === 10 ? `229${digits}` : digits;
  const text = `Joyeux anniversaire ${firstName} ! Que l'Éternel te bénisse et te garde (Nombres 6:24). Toute la famille de l'EBB-JR de Tanmey se réjouit avec toi.`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
