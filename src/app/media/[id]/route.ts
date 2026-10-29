import { db } from "@/lib/db";

// Photos envoyées depuis l'administration (contenu immuable : mises en cache un an)
export async function GET(_request: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const m = await db.media.findUnique({ where: { id }, select: { data: true, mime: true } });
  if (!m) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(m.data), {
    headers: { "Content-Type": m.mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
