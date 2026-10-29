import { NextResponse, type NextRequest } from "next/server";
import { runReminders } from "@/lib/reminders";

// Appelé toutes les 15 minutes par une tâche planifiée externe (voir README).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? request.nextUrl.searchParams.get("cle");
  if (!secret || given !== secret) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const sent = await runReminders();
  return NextResponse.json({ ok: true, sent });
}
