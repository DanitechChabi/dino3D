// Génération de fichiers iCalendar (.ics) : ajout à l'agenda et flux d'abonnement.

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function esc(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Replie les lignes à 75 octets comme l'exige la norme. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 74;
    while (Buffer.byteLength(rest.slice(0, cut)) > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

export type IcsEvent = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date | null;
  url?: string;
  // Récurrence des cultes : chaque semaine, ou certaines semaines du mois
  weeklyOn?: number;
  monthWeeks?: number[];
  alarms?: number[]; // minutes avant le début
};

export function buildIcs(name: string, events: IcsEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EBB-JR Tanmey//Calendrier//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    "X-WR-TIMEZONE:Africa/Porto-Novo",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
  ];
  const now = stamp(new Date());
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(e.end ?? new Date(e.start.getTime() + 2 * 3600_000))}`,
      `SUMMARY:${esc(e.title)}`,
    );
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    if (e.weeklyOn !== undefined) {
      lines.push(
        e.monthWeeks?.length
          ? `RRULE:FREQ=MONTHLY;BYDAY=${e.monthWeeks.map((w) => `${w}${DAY_CODES[e.weeklyOn!]}`).join(",")}`
          : `RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[e.weeklyOn]}`,
      );
    }
    for (const m of e.alarms ?? []) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)}`, `TRIGGER:-PT${m}M`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Lien « Ajouter à Google Agenda ». */
export function googleCalendarUrl(e: { title: string; start: Date; end?: Date | null; description?: string; location?: string }) {
  const end = e.end ?? new Date(e.start.getTime() + 2 * 3600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(end)}`,
    details: e.description ?? "",
    location: e.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
